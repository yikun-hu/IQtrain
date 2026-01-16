import { defineConfig, splitVendorChunkPlugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

const preconnectPlugin = (supabaseUrl?: string) => ({
  name: 'preconnect-plugin',
  transformIndexHtml(html: string) {
    if (!supabaseUrl) return html;
    return html.replace(
      '</head>',
      `<link rel="preconnect" href="${supabaseUrl}" crossorigin></head>`
    );
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // 读取 .env / .env.[mode]
  const supabaseUrl = env.VITE_SUPABASE_URL;   // ✅ 这里能拿到


  return {
    plugins: [react(), svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent',
      },
    }), splitVendorChunkPlugin(), preconnectPlugin(supabaseUrl)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // React & router
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('react-router') || id.includes('history')) return 'router-vendor';

            // PayPal 相关单独拆出去（配合“只在 /payment 才用”效果更佳）
            if (id.includes('@paypal')) return 'paypal-vendor';

            // 如果你用了 Radix / shadcn（常见：@radix-ui）
            if (id.includes('@radix-ui')) return 'radix-vendor';

            // 其它第三方兜底
            return 'vendor';
          },
        },
      },
    }
  }
});
