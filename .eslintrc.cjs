module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'prefer-destructuring': ['error', { 'object': true, 'array': false }],
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_', 'destructuredArrayIgnorePattern': '^_', 'ignoreRestSiblings': true }],
    'no-prototype-builtins': 'error',
    'radix': 'error'
  }
};