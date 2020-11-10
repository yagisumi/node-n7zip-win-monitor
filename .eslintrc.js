const TypeScriptRules = {
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-namespace': 'off',
  '@typescript-eslint/no-empty-function': 'off',
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': ['error', { ignoreTypeValueShadow: true }],
  '@typescript-eslint/strict-boolean-expressions': [
    'error',
    {
      allowString: false,
      allowNumber: false,
      allowNullableBoolean: true,
    },
  ],
}

module.exports = {
  ignorePatterns: [
    '/build/', //
    '/dist/',
  ],
  extends: [
    'plugin:vue/vue3-essential', //
    'eslint:recommended',
    '@vue/prettier',
  ],
  env: { browser: true, node: true, es2017: true },
  parserOptions: { sourceType: 'module' },
  rules: {
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-shadow': 'error',
    'no-empty': ['warn', { allowEmptyCatch: true }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended', //
        'prettier/@typescript-eslint',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: TypeScriptRules,
    },
    {
      files: ['*.vue'],
      extends: [
        '@vue/typescript/recommended', //
        '@vue/prettier/@typescript-eslint',
      ],
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        // workaround: https://github.com/microsoft/TypeScript/issues/40495
        createDefaultProgram: true,
      },
      rules: TypeScriptRules,
    },
  ],
}
