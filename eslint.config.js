// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.native.ts', '.native.tsx', '.web.ts', '.web.tsx'],
        },
      },
    },
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@/'] }],
    },
  },
]);
