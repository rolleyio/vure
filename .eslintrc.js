module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  plugins: ['prettier'],
  extends: ['prettier', 'plugin:prettier/recommended', 'plugin:vue/vue3-essential'],
  rules: {},
};
