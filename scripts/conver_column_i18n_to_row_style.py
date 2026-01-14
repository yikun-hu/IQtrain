import csv
import json
import os
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

try:
    from tqdm import tqdm
except ImportError:
    tqdm = None

# ================= 配置区域 =================
CONFIG = {
    "API_BASE": "https://api.openai-proxy.org/v1",
    "API_KEY": "sk-6JkqJxx8df1yJ5MOYWW0Y3wmTmY0BuBN2KlykeT0qR1txmfY",  # 替换为你的 Key

    
    # 需要补全的目标语言
    "REQUIRED_LANGUAGES": ["en-US", "zh-CN", "de-DE", "fr-FR", "zh-TW"],
    
    # CSV 简写 -> JSON Key 映射
    "CSV_LANG_MAP": {
        "en": "en-US",
        "zh": "zh-CN"
    },

    "INPUT_DIR": "tables_to_translate",
    "OUTPUT_FILE": "migration_json_schema_fix.sql",
    "BATCH_SIZE": 10,
    "MAX_WORKERS": 8,
    "MODEL": "gpt-4o"
}

# 表结构定义
TABLE_CONFIGS = {
    "scale_test_configs": {
        "filename": "scale_test_configs_rows.csv",
        "unique_keys": ["test_type"], 
        # 这些字段将被合并为多语言 JSON，并且需要在数据库中修改类型为 JSONB
        "json_fields": ["name", "action_plan", "dimensions", "recommendations"],
        # 指示这些字段在 CSV 原文中本身就是 JSON 字符串，需要先解析
        "is_json_content": ["action_plan", "dimensions", "recommendations"], 
        # 不需要翻译，直接保留的字段
        "keep_columns": ["test_type", "short_name", "percentiles", "created_at", "updated_at"]
    },
    "scale_scoring_rules": {
        "filename": "scale_scoring_rules_rows.csv",
        "unique_keys": ["test_type", "level", "score_min", "score_max"],
        "json_fields": ["ability_dimensions", "label", "interpretation", "feedback"],
        "is_json_content": ["ability_dimensions"],
        "keep_columns": ["test_type", "level", "score_min", "score_max", "color", "created_at", "updated_at"]
    }
}

client = OpenAI(api_key=CONFIG["API_KEY"], base_url=CONFIG["API_BASE"])

def escape_sql(val, is_jsonb=False):
    """
    处理 SQL 转义。
    is_jsonb: 如果为 True，不做额外的 quote 包裹，留给调用者处理，
              因为我们需要追加 ::jsonb 后缀
    """
    if val is None: return "NULL"
    if isinstance(val, bool): return "true" if val else "false"
    if isinstance(val, (int, float)): return str(val)
    if isinstance(val, (dict, list)): val = json.dumps(val, ensure_ascii=False)
    
    str_val = str(val)
    # 将 SQL 中的单引号转义为两个单引号
    escaped_str = str_val.replace("'", "''")
    
    return f"'{escaped_str}'"

def translate_batch(batch_data):
    """调用 LLM 补全缺失语言"""
    if not batch_data: return {}
    required_langs = CONFIG["REQUIRED_LANGUAGES"]
    
    system_prompt = f"""You are a database migration assistant.
Input is a JSON object where keys are IDs and values are partially filled multilingual dictionaries.
Your task is to:
1. Keep existing languages exactly as they are.
2. Translate/Fill missing languages from this list: {required_langs}.
3. Return the fully populated JSON object.
Output strictly JSON.
"""
    for _ in range(3):
        try:
            response = client.chat.completions.create(
                model=CONFIG["MODEL"],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": json.dumps(batch_data, ensure_ascii=False, indent=2)}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Batch failed, retrying... {e}")
            time.sleep(2)
    return {}

def process_table(table_name, config):
    filepath = os.path.join(CONFIG["INPUT_DIR"], config["filename"])
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return []
    
    print(f"Processing {table_name}...")
    
    # === 1. 读取并聚合数据 ===
    grouped_data = {} 
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            u_key = tuple(row[k] for k in config["unique_keys"])
            csv_lang = row.get("language", "en")
            std_lang = CONFIG["CSV_LANG_MAP"].get(csv_lang, csv_lang)
            
            if u_key not in grouped_data:
                grouped_data[u_key] = {
                    "base_row": row,
                    "fields": defaultdict(dict)
                }
                if std_lang == "en-US":
                    grouped_data[u_key]["base_row"] = row

            for field in config["json_fields"]:
                raw_val = row.get(field)
                if raw_val:
                    if field in config["is_json_content"]:
                        try:
                            val = json.loads(raw_val)
                        except:
                            val = raw_val
                    else:
                        val = raw_val
                    grouped_data[u_key]["fields"][field][std_lang] = val

    # === 2. 准备翻译任务 ===
    tasks = []
    for u_key, data in grouped_data.items():
        u_key_str = "_".join(u_key)
        for field, lang_map in data["fields"].items():
            task_id = f"{u_key_str}__SEP__{field}"
            tasks.append((task_id, lang_map))

    # === 3. 并发翻译 ===
    translated_results = {}
    batch_list = []
    for i in range(0, len(tasks), CONFIG["BATCH_SIZE"]):
        batch = {k: v for k, v in tasks[i : i + CONFIG["BATCH_SIZE"]]}
        batch_list.append(batch)
    
    print(f"  - Aggregated into {len(grouped_data)} entities. Starting {len(batch_list)} translation batches...")
    
    with ThreadPoolExecutor(max_workers=CONFIG["MAX_WORKERS"]) as executor:
        futures = {executor.submit(translate_batch, b): b for b in batch_list}
        if tqdm: pbar = tqdm(total=len(batch_list), desc=f"  Translating {table_name}")
        
        for future in as_completed(futures):
            try:
                res = future.result()
                translated_results.update(res)
            except Exception as e:
                print(f"Error: {e}")
            if tqdm: pbar.update(1)
        if tqdm: pbar.close()

    # === 4. 生成 SQL ===
    sqls = []
    
    # [Step A] 生成 Schema 变更语句
    # 先删除旧数据以避免类型转换冲突，或者使用 USING 子句强制转换（这里选择先删数据更安全）
    sqls.append(f"-- Cleaning old data for {table_name}")
    sqls.append(f"DELETE FROM {table_name};")
    sqls.append("")
    
    sqls.append(f"-- Altering columns to JSONB for {table_name}")
    for field in config["json_fields"]:
        # 生成 ALTER TABLE 语句
        # 使用 USING NULL 是因为我们反正要清空数据重新插入。
        # 如果不清空，应该用 USING col::jsonb (但旧数据格式不同会报错)
        sqls.append(f"ALTER TABLE {table_name} ALTER COLUMN {field} TYPE jsonb USING {field}::jsonb;")
    sqls.append("")

    # [Step B] 生成 INSERT 语句
    for u_key, data in grouped_data.items():
        base_row = data["base_row"]
        u_key_str = "_".join(u_key)
        insert_dict = {}
        insert_dict["id"] = base_row["id"]
        
        # 保留字段
        for col in config["keep_columns"]:
            insert_dict[col] = base_row.get(col)
            
        # 翻译字段
        for field in config["json_fields"]:
            task_id = f"{u_key_str}__SEP__{field}"
            final_json = translated_results.get(task_id, data["fields"][field])
            insert_dict[field] = final_json
            
        cols = []
        vals = []
        for k, v in insert_dict.items():
            if k == "language": continue # 移除 language 列
            
            if k in ["created_at", "updated_at"]:
                cols.append(k)
                vals.append("NOW()")
            else:
                cols.append(k)
                
                # 特殊处理：如果是 JSONB 字段，追加显式类型转换
                if k in config["json_fields"]:
                    # 这里 v 是 dict，escape_sql 会转成 '{"...": ...}'
                    val_str = escape_sql(v)
                    vals.append(f"{val_str}::jsonb") # !!! 关键修复 !!!
                else:
                    # 普通字段 (如 percentiles, short_name)
                    vals.append(escape_sql(v))
        
        sqls.append(f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({', '.join(vals)});")
        
    return sqls

def main():
    all_sqls = []
    
    # 开头加上事务处理，防止中间出错
    all_sqls.append("BEGIN;") 
    
    for table, config in TABLE_CONFIGS.items():
        all_sqls.extend(process_table(table, config))
        all_sqls.append("")
        
    all_sqls.append("COMMIT;") 
    
    with open(CONFIG["OUTPUT_FILE"], 'w', encoding='utf-8') as f:
        f.write("\n".join(all_sqls))
        
    print(f"\nDone! Migration SQL saved to {CONFIG['OUTPUT_FILE']}")

if __name__ == "__main__":
    main()