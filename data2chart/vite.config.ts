import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.ts',
      name: 'Data2Chart',
      fileName: (format) => `data-2-chart.${format}.js`,
    },
  },
});