import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config({
  files: ['**/*.ts', '**/*.tsx'], // TypeScript 및 JSX 파일에 적용
  extends: [
    eslint.configs.recommended, // JavaScript 기본 권장 규칙
    tseslint.configs.recommended, // TypeScript 권장 규칙
  ],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    react,
    prettier,
  },
  rules: {
    'prettier/prettier': 'error', // Prettier 규칙 적용
    'react/react-in-jsx-scope': 'off', // React 17+에서는 JSX 사용 시 React 불필요
    '@typescript-eslint/no-explicit-any': 'warn', // any 타입 사용 시 경고
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 함수 반환 타입 명시 비활성화
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 사용하지 않는 변수 경고 (예외: _로 시작하는 변수)
    '@typescript-eslint/consistent-type-imports': 'warn', // `import type {}` 사용 권장
  },
});
