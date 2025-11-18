import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

import AutoImport from 'unplugin-auto-import/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(),
  AutoImport(
    {
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        'vue',
      ],
      dts: './src/types/auto-imports.d.ts',
    }
  )],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
  },
})
