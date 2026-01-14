import os
import sys
import requests
from pathlib import Path

# ================= 配置 =================
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai-proxy.org/v1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "sk-6JkqJxx8df1yJ5MOYWW0Y3wmTmY0BuBN2KlykeT0qR1txmfY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

I18N_DIR = Path("src/i18n")
EXCLUDE_FILES = {"translation.ts"}
# =======================================

if not OPENAI_API_KEY:
    raise RuntimeError("请设置 OPENAI_API_KEY")

TARGET_LANG = sys.argv[1] if len(sys.argv) > 1 else "de-DE"


def translate_file(ts_content: str, filename: str) -> str:
    prompt = f"""
你是一个专业的前端 i18n 翻译引擎。

下面是一个 TypeScript i18n 文件的完整内容：
--------------------------------
{ts_content}
--------------------------------

现在请你 **在不破坏任何现有代码结构的前提下**，
为该文件新增一种语言："{TARGET_LANG}"。

严格要求：
1. 输出必须是 **完整、可直接使用的 .ts 文件**
2. 必须保留 export default 及已有所有语言
3. 新增 "{TARGET_LANG}" 语言，与其他语言结构完全一致
4. 只翻译字符串内容，不修改 key、不调整结构、不重排顺序
5. 必须保留占位符（如 {{current}} {{total}}）
6. 不要添加、删除或重命名任何字段
7. 不要输出任何解释、注释、Markdown
8. 只输出代码

文件名：{filename}
""".strip()

    resp = requests.post(
        f"{OPENAI_API_BASE}/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENAI_MODEL,
            "temperature": 0,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=180,
    )

    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


def process_file(path: Path):
    content = path.read_text(encoding="utf-8")

    if f'"{TARGET_LANG}"' in content:
        print(f"⏭ 已存在 {TARGET_LANG}，跳过：{path.name}")
        return

    print(f"🌍 翻译中：{path.name}")
    new_content = translate_file(content, path.name)

    path.write_text(new_content, encoding="utf-8")
    print(f"✅ 完成：{path.name}")


def main():
    for ts_file in I18N_DIR.glob("*.ts"):
        if ts_file.name in EXCLUDE_FILES:
            continue
        if "iqreport.ts" in ts_file.name:
            # continue
            process_file(ts_file)


if __name__ == "__main__":
    main()
