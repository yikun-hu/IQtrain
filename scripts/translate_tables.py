import csv
import json
import uuid
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

# 尝试导入 tqdm 用于显示进度条
try:
    from tqdm import tqdm
except ImportError:
    tqdm = None

# ================= 配置区域 =================
CONFIG = {
    "API_BASE": "https://api.openai-proxy.org/v1",
    "API_KEY": "sk-6JkqJxx8df1yJ5MOYWW0Y3wmTmY0BuBN2KlykeT0qR1txmfY",  # 替换为你的 Key
    
    # === 多语言配置 ===
    "TARGET_LANGUAGES": {
        "de": "de-DE",    # 德语
        "fr": "fr-FR",    # 法语
        "zh-TW": "zh-TW"  # 繁体中文 (测试用)
    },
    
    "INPUT_DIR": "tables_to_translate",
    "OUTPUT_FILE": "translation_multilang_fixed.sql",
    "BATCH_SIZE": 10,
    "MAX_WORKERS": 8,
    "MODEL": "gpt-4o"
}

# 表配置
TABLE_CONFIGS = {
    "games": {
        "filename": "games_rows.csv",
        "type": "JSON_UPDATE",
        "id_column": "id",
        "target_columns": ["title", "description"],
        "context_columns": ["category"]
    },
    "scale_test_questions": {
        "filename": "scale_test_questions_rows.csv",
        "type": "JSON_UPDATE",
        "id_column": "id",
        "target_columns": ["question_text"],
        "context_columns": ["test_type"]
    },
    # "scale_scoring_rules": {
    #     "filename": "scale_scoring_rules_rows.csv",
    #     "type": "ROW_INSERT",
    #     "filter_lang": "en",
    #     "translatable_text_cols": ["label", "interpretation", "feedback"],
    #     "translatable_json_keys": ["ability_dimensions"],
    #     "translatable_json_values": []
    # },
    # "scale_test_configs": {
    #     "filename": "scale_test_configs_rows.csv",
    #     "type": "ROW_INSERT",
    #     "filter_lang": "en",
    #     "translatable_text_cols": ["name"],
    #     "translatable_json_keys": ["dimensions"],
    #     "translatable_json_values": ["recommendations", "action_plan"]
    # }
}

# ================= 初始化 =================
client = OpenAI(api_key=CONFIG["API_KEY"], base_url=CONFIG["API_BASE"])

def escape_sql(val):
    """
    处理 SQL 转义，核心修复点：
    1. 确保单引号 ' 变为 ''
    2. 处理 JSON 对象转字符串
    3. 返回包裹在单引号中的字符串
    """
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, (int, float)):
        return str(val)
    
    # 如果是 dict 或 list，先转为 JSON 字符串
    if isinstance(val, (dict, list)):
        val = json.dumps(val, ensure_ascii=False)
    
    # 强制转为字符串
    str_val = str(val)
    
    # 核心：将 SQL 中的单引号转义为两个单引号
    # 例如: "Rubik's" -> "Rubik''s"
    escaped_str = str_val.replace("'", "''")
    
    return f"'{escaped_str}'"

def get_translation_from_llm(batch_data, target_lang_code):
    """调用 LLM 进行翻译"""
    if not batch_data: return {}

    system_prompt = f"""You are a professional translator localizing database content into {target_lang_code}.
Input is a JSON object where keys are IDs and values contain source text(s).
Output strictly a valid JSON object where keys match the input IDs and values are the translated strings.
Do not include any explanations. Just the JSON.
"""
    user_prompt_content = json.dumps(batch_data, ensure_ascii=False, indent=2)
    
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=CONFIG["MODEL"],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Translate:\n{user_prompt_content}"}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            if attempt == 2: print(f"  [Error] {target_lang_code} batch failed: {e}")
            time.sleep(2 * (attempt + 1))
    return {}

def process_single_table(table_name, config):
    file_path = os.path.join(CONFIG["INPUT_DIR"], config["filename"])
    if not os.path.exists(file_path):
        print(f"Skipping {table_name}: File not found.")
        return []

    print(f"Reading {table_name}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # === 1. 构建任务队列 ===
    queues = {lang_code: {} for lang_code in CONFIG["TARGET_LANGUAGES"].keys()}
    rows_to_insert_meta = [] 
    rows_to_update = [] 

    if config['type'] == "JSON_UPDATE":
        for row in rows:
            row_id = row[config['id_column']]
            needs_update = False
            for col in config['target_columns']:
                try:
                    data = json.loads(row[col])
                    context = f"Context: {row.get(config['context_columns'][0], '')}" if config.get('context_columns') else ""
                    for lang_code, lang_key in CONFIG["TARGET_LANGUAGES"].items():
                        if lang_key not in data:
                            needs_update = True
                            key = f"{row_id}__{col}"
                            queues[lang_code][key] = {"source_languages": data, "context_info": context}
                except: pass
            if needs_update:
                rows_to_update.append(row)

    elif config['type'] == "ROW_INSERT":
        source_rows = [r for r in rows if r.get('language') == config['filter_lang']]
        for row in source_rows:
            for lang_code in CONFIG["TARGET_LANGUAGES"].keys():
                new_id = str(uuid.uuid4())
                rows_to_insert_meta.append({"new_id": new_id, "lang_code": lang_code, "source_row": row})
                
                for col in config.get('translatable_text_cols', []):
                    queues[lang_code][f"{new_id}__{col}"] = {"text": row[col], "type": "plain_text"}
                for col in config.get('translatable_json_keys', []):
                    try:
                        data = json.loads(row[col])
                        for k in data.keys():
                            queues[lang_code][f"{new_id}__{col}__key__{k}"] = {"text": k, "context": f"Key in {col}"}
                    except: pass
                for col in config.get('translatable_json_values', []):
                    try:
                        data = json.loads(row[col])
                        if isinstance(data, list):
                            for idx, item in enumerate(data):
                                queues[lang_code][f"{new_id}__{col}__idx__{idx}"] = {"text": item, "context": f"Item in {col}"}
                    except: pass

    # === 2. 并发翻译 ===
    all_batches = []
    for lang_code, queue in queues.items():
        keys = list(queue.keys())
        for i in range(0, len(keys), CONFIG["BATCH_SIZE"]):
            batch_keys = keys[i : i + CONFIG["BATCH_SIZE"]]
            all_batches.append(({k: queue[k] for k in batch_keys}, lang_code))

    translated_results = {lang_code: {} for lang_code in CONFIG["TARGET_LANGUAGES"].keys()}

    if all_batches:
        print(f"  - Processing {len(all_batches)} batches...")
        with ThreadPoolExecutor(max_workers=CONFIG["MAX_WORKERS"]) as executor:
            future_to_meta = {executor.submit(get_translation_from_llm, b, l): l for b, l in all_batches}
            if tqdm: pbar = tqdm(total=len(all_batches), desc=f"  Translating {table_name}", unit="batch")
            
            for future in as_completed(future_to_meta):
                lang_code = future_to_meta[future]
                try:
                    res = future.result()
                    if res: translated_results[lang_code].update(res)
                except Exception as e: print(f"Error: {e}")
                if tqdm: pbar.update(1)
            if tqdm: pbar.close()

    # === 3. 生成 SQL (重点修复区域) ===
    print(f"  - Generating SQL...")
    sql_statements = []

    if config['type'] == "JSON_UPDATE":
        for row in rows_to_update:
            row_id = row[config['id_column']]
            updates = []
            
            for col in config['target_columns']:
                try:
                    data = json.loads(row[col])
                    changed = False
                    key = f"{row_id}__{col}"
                    
                    for lang_code, lang_key in CONFIG["TARGET_LANGUAGES"].items():
                        if key in translated_results[lang_code]:
                            data[lang_key] = translated_results[lang_code][key]
                            changed = True
                    
                    if changed:
                        json_str = json.dumps(data, ensure_ascii=False)
                        # !!! 修复点 !!! 
                        # 之前是: updates.append(f"{col} = '{json_str}'")
                        # 现在调用 escape_sql，它会处理 json_str 内部的单引号
                        escaped_val = escape_sql(json_str) 
                        updates.append(f"{col} = {escaped_val}")
                except: pass
            
            if updates:
                sql_statements.append(f"UPDATE {table_name} SET {', '.join(updates)}, updated_at = NOW() WHERE {config['id_column']} = '{row_id}';")

    elif config['type'] == "ROW_INSERT":
        for meta in rows_to_insert_meta:
            new_id = meta['new_id']
            lang_code = meta['lang_code']
            row = meta['source_row']
            target_lang_val = lang_code 

            insert_data = row.copy()
            insert_data['id'] = new_id
            insert_data['language'] = target_lang_val 
            insert_data.pop('_new_id', None)

            lang_results = translated_results[lang_code]

            for col in config.get('translatable_text_cols', []):
                key = f"{new_id}__{col}"
                if key in lang_results:
                    insert_data[col] = lang_results[key]
            
            for col in config.get('translatable_json_keys', []):
                try:
                    orig = json.loads(row[col])
                    new_d = {}
                    for k, v in orig.items():
                        t_key = lang_results.get(f"{new_id}__{col}__key__{k}", k)
                        new_d[t_key] = v
                    insert_data[col] = json.dumps(new_d, ensure_ascii=False)
                except: pass
            
            for col in config.get('translatable_json_values', []):
                try:
                    orig = json.loads(row[col])
                    if isinstance(orig, list):
                        new_l = [lang_results.get(f"{new_id}__{col}__idx__{idx}", item) for idx, item in enumerate(orig)]
                        insert_data[col] = json.dumps(new_l, ensure_ascii=False)
                except: pass

            cols = []
            vals = []
            for k, v in insert_data.items():
                if k in ['created_at', 'updated_at']:
                    cols.append(k)
                    vals.append("NOW()")
                else:
                    cols.append(k)
                    # ROW_INSERT 此时也调用同一个增强版 escape_sql，确保安全
                    vals.append(escape_sql(v))
            
            sql_statements.append(f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({', '.join(vals)});")

    return sql_statements

def main():
    all_sql = []
    print(f"Target Languages: {list(CONFIG['TARGET_LANGUAGES'].keys())}")
    for table_name, config in TABLE_CONFIGS.items():
        all_sql.extend(process_single_table(table_name, config))
        print(f"  > Done {table_name}.\n")

    with open(CONFIG["OUTPUT_FILE"], 'w', encoding='utf-8') as f:
        f.write("\n".join(all_sql))
    print(f"Done! Saved to {CONFIG['OUTPUT_FILE']}")

if __name__ == "__main__":
    main()