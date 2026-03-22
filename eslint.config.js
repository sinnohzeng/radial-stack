import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        matchMedia: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Image: 'readonly',
        DOMParser: 'readonly',
        CustomEvent: 'readonly',
        FileReader: 'readonly',
        FontFace: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Node globals
        process: 'readonly',
        Module: 'writable',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'output/', 'web/public/'],
  },
];
