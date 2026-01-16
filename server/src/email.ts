import { Env } from "./db";
// import { Request } from "@cloudflare/workers-types";

function pickBranch(block: string, language: string) {
  // block content looks like:
  // {{- if eq .Data.language "zh-CN" -}}A{{- else if eq .Data.language "fr-FR" -}}B{{- else -}}C{{- end -}}
  // We'll parse by splitting on else-if / else markers.

  const IF_RE = /{{-\s*if\s+eq\s+\.Data\.language\s+"([^"]+)"\s*-}}/;
  const ELSE_IF_RE = /{{-\s*else if\s+eq\s+\.Data\.language\s+"([^"]+)"\s*-}}/g;
  const ELSE_RE = /{{-\s*else\s*-}}/;
  const END_RE = /{{-\s*end\s*-}}/;

  const ifMatch = block.match(IF_RE);
  if (!ifMatch) return block;

  // strip leading if marker
  const afterIf = block.slice(block.indexOf(ifMatch[0]) + ifMatch[0].length);
  const endIdx = afterIf.search(END_RE);
  const inner = endIdx >= 0 ? afterIf.slice(0, endIdx) : afterIf;

  // Now we need to extract segments:
  // segment0 (for if language = ifMatch[1]) until first else-if/else
  // then each else-if segment
  // else segment
  const markers: { type: "elseIf"; lang: string; idx: number; len: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = ELSE_IF_RE.exec(inner))) {
    markers.push({ type: "elseIf", lang: m[1], idx: m.index, len: m[0].length });
  }
  const elseMatch = inner.match(ELSE_RE);
  const elseIdx = elseMatch ? inner.indexOf(elseMatch[0]) : -1;

  const segments: { lang: string | null; text: string }[] = [];

  const firstCut = markers.length ? markers[0].idx : (elseIdx >= 0 ? elseIdx : inner.length);
  segments.push({ lang: ifMatch[1], text: inner.slice(0, firstCut) });

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].idx + markers[i].len;
    const end = (i + 1 < markers.length)
      ? markers[i + 1].idx
      : (elseIdx >= 0 ? elseIdx : inner.length);
    segments.push({ lang: markers[i].lang, text: inner.slice(start, end) });
  }

  if (elseIdx >= 0) {
    const elseStart = elseIdx + (elseMatch![0].length);
    segments.push({ lang: null, text: inner.slice(elseStart) });
  }

  const chosen =
    segments.find(s => s.lang === language) ??
    segments.find(s => s.lang === "en-US") ??
    segments.find(s => s.lang === null) ??
    segments[0];

  return chosen.text;
}

function renderGoLikeTemplate(template: string, data: { language?: string; Token: string }) {
  const language = data.language || "en-US";

  // handle: {{ if .Data.language }}{{ .Data.language }}{{ else }}en-US{{ end }}
  template = template.replace(
    /{{\s*if\s+\.Data\.language\s*}}([\s\S]*?){{\s*else\s*}}([\s\S]*?){{\s*end\s*}}/g,
    (_m, ifPart, elsePart) => (data.language ? ifPart : elsePart)
  );
  template = template.replace(/{{\s*\.Data\.language\s*}}/g, language);

  // repeatedly resolve {{- if eq ... -}} ... {{- end -}}
  // We assume no nesting (your template blocks are not nested).
  const START = "{{- if eq .Data.language";
  while (true) {
    const s = template.indexOf(START);
    if (s < 0) break;
    const e = template.indexOf("{{- end -}}", s);
    if (e < 0) break;

    const block = template.slice(s, e + "{{- end -}}".length);
    const chosen = pickBranch(block, language);
    template = template.slice(0, s) + chosen + template.slice(e + "{{- end -}}".length);
  }

  template = template.replace(/{{\s*\.Token\s*}}/g, data.Token);

  // cleanup leftover go template spaces like {{- ... -}}
  template = template.replace(/{{-\s*/g, "{{").replace(/\s*-}}/g, "}}");
  return template;
}

export async function sendOtpEmail(env: Env, to: string, token: string, language?: string) {
  // 从 Assets 读取模板（Vite build 会把 public/ 复制到 dist/）
  const res = await env.ASSETS.fetch(new Request("https://assets.local/email-templates/confirm-sign-up.html"));
  if (!res.ok) throw new Error(`Failed to load email template: ${res.status}`);
  const tpl = await res.text();

  const html = renderGoLikeTemplate(tpl, { language, Token: token });

  // MailChannels 发送（你也可以换 Resend/SendGrid：只改这里）
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: env.MAIL_FROM, name: "IQ Train" },
    subject:
      language === "zh-CN" ? "确认注册" :
      language === "zh-TW" ? "確認註冊" :
      language === "de-DE" ? "Registrierung bestätigen" :
      language === "fr-FR" ? "Confirmez votre inscription" :
      "Confirm Your Signup",
    content: [{ type: "text/html", value: html }],
  };

  const r = await fetch(env.MAILCHANNELS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Mail send failed: ${r.status} ${t}`);
  }
}
