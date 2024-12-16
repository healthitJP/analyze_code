import { defineConfig } from 'vite';
import obfuscator from 'javascript-obfuscator';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'Data2Chart',
      fileName: (format) => `data-2-chart.${format}.js`,
    },
    minify: 'terser', // terserを利用してコードを圧縮・難読化
    terserOptions: {
      compress: {
        drop_console: true, // console.log を削除
        drop_debugger: true, // debugger を削除
      },
      format: {
        comments: false, // コメントを削除
      },
    },
    // rollupOptions: {
    //   plugins: [
    //     {
    //       name: 'obfuscator',
    //       generateBundle(_, bundle) {
    //         for (const file in bundle) {
    //           if (bundle[file].type === 'chunk') {
    //             const chunk = bundle[file];
    //             const obfuscated = obfuscator.obfuscate(chunk.code, {
    //               compact: true,
    //               controlFlowFlattening: true,
    //               deadCodeInjection: true,
    //               debugProtection: true,
    //               disableConsoleOutput: true,
    //               stringArray: true,
    //               stringArrayThreshold: 0.75,
    //             });
    //             chunk.code = obfuscated.getObfuscatedCode();
    //           }
    //         }
    //       },
    //     },
    //   ],
    //   output: {
    //     preserveModules: false, // モジュールを1つのファイルに統合
    //     globals: {}, // 必要に応じて外部依存を指定
    //   },
    // },
  },
});