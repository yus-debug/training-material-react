module.exports = {
  root: false,
  extends: [
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  parserOptions: {
    project: true
  },
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/no-extraneous-dependencies': 'off'
  }
}


