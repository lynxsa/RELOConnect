// Root .eslintrc.js for monorepo
module.exports = {
  root: true,
  extends: [
    '@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-unused-vars': 'off',
  },
  overrides: [
    {
      // React Native specific overrides for user-app and driver-app
      files: ['apps/user-app/**/*', 'apps/driver-app/**/*'],
      extends: [
        'airbnb',
        'airbnb-typescript',
        'airbnb/hooks',
      ],
      plugins: ['react-native'],
      env: {
        'react-native/react-native': true,
      },
      rules: {
        // React Native specific rules
        'react-native/no-unused-styles': 'error',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-color-literals': 'warn',
        'react-native/split-platform-components': 'warn',
        'react-native/no-raw-text': 'error',
        'react-native/no-single-element-style-arrays': 'warn',
        
        // Import rules for React Native
        'import/no-extraneous-dependencies': 'off',
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        
        // JSX rules
        'jsx-a11y/accessible-emoji': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        
        // Style rules
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
        'react/jsx-props-no-spreading': 'off',
        'react/no-array-index-key': 'warn',
        'react/require-default-props': 'off',
        'react/function-component-definition': 'off',
        
        // Allow console in development
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        
        // TypeScript specific
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-use-before-define': 'error',
        'no-shadow': 'off',
        'no-use-before-define': 'off',
      },
    },
    {
      // Admin Dashboard specific overrides (Next.js)
      files: ['apps/admin-dashboard/**/*'],
      extends: [
        'next/core-web-vitals'
      ],
      rules: {
        'react-native/no-raw-text': 'off',
        'react-native/no-unused-styles': 'off',
        'react-native/split-platform-components': 'off',
        'react-native/no-inline-styles': 'off',
        'react-native/no-color-literals': 'off',
        'react/react-in-jsx-scope': 'off',
      },
    },
    {
      // Backend specific overrides
      files: ['backend/**/*'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
        'import/prefer-default-export': 'off',
      },
    },
  ],
};
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    
    // Import rules
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/jest.config.js',
          '**/jest.setup.js',
        ],
      },
    ],
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
