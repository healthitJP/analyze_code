import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts', // エントリーポイント（TypeScriptファイル）
      name: 'Data2Chart', // ライブラリのグローバル変数名
      fileName: (format) => `data-2-chart.${format}.js`, // 出力ファイル名
    },
    rollupOptions: {
      output: {
        // scriptタグで使いやすいようにUMD形式で出力
        format: 'umd',
        globals: {}, // 外部依存をグローバル変数として解決する場合
      },
    },
  },
});
