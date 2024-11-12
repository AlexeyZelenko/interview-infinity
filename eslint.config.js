import { defineConfig } from 'eslint-define-config';
import vuePlugin from 'eslint-plugin-vue';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import vueParser from 'vue-eslint-parser';

export default defineConfig([
  {
    files: ["**/*.vue", "**/*.js", "**/*.ts"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
      },
      parser: vueParser, // Используем vue-eslint-parser как парсер для Vue файлов
      parserOptions: {
        parser: '@typescript-eslint/parser', // Парсер для секции <script> в файлах Vue (указан через строку)
        ecmaVersion: 12,
        sourceType: 'module'
      },
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
    }
  }
]);
