import { Env } from "./db";
import { corsify } from "./utils";
import { handleApi } from "./router";
// import { ExecutionContext, Response, Request } from '@cloudflare/workers-types'

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // preflight
    if (req.method === "OPTIONS") {
      return corsify(new Response(null, { status: 204 }));
    }

    const url = new URL(req.url);

    // API 走 Worker
    if (url.pathname.startsWith("/api/")) {
      const resp = await handleApi(env, req);
      return corsify(resp);
    }

    // 其余交给静态资源（Vite build output dist/）
    return env.ASSETS.fetch(req);
  },
};
