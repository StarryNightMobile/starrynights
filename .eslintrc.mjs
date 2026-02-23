import { FlatCompat } from '@eslint/js';
const compat = new FlatCompat({ baseDirectory: new URL('.', import.meta.url).pathname });

export default [
  ...compat.extends('eslint:recommended'),
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'indent': ['error', 2],
      'eqeqeq': ['error', 'always']
    },
    env: { node: true, es2021: true },
    parserOptions: { ecmaVersion: 'latest' }
  }
];