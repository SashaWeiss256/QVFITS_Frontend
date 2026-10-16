import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import pluginQuery from '@tanstack/eslint-plugin-query'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * Layering and isolation, enforced rather than described.
 *
 * component → query hook → service → api. Each layer knows the one below it
 * and nothing above (docs/03-data-layer.md). The admin and the customer
 * dashboards are two separate apps in one repo and never import each other;
 * only src/routes and App.jsx see both (docs/02-folder-structure.md).
 */
const TRANSPORT = {
  group: ['@/store/tanstackStore/services/api/**', '**/api/client', '**/api/mock', '**/api/tokens'],
  message: 'UI talks to a query hook, never to the transport.',
}
const SERVICES = {
  group: ['@/store/tanstackStore/services/**'],
  message: 'UI reads and writes through src/store/tanstackStore/queries/ (site, account or admin), never a service directly.',
}
const DATA = {
  group: ['@/data/*', '**/data/*'],
  message: 'Fixtures are read through src/store/tanstackStore/services/, never imported by UI.',
}
const ADMIN = {
  group: ['@/AdminDashboard/**', '**/AdminDashboard/**'],
  message: 'The admin dashboard is its own app. Move shared code down to src/components, src/utils or src/store.',
}
const CUSTOMER = {
  group: ['@/CustomerDashboard/**', '**/CustomerDashboard/**'],
  message: 'The customer dashboard is its own app. Move shared code down to src/components, src/utils or src/store.',
}
const SITE = {
  group: ['@/pages/**', '**/pages/[0-9]*/**'],
  message: 'Dashboards never import storefront pages.',
}

export default defineConfig([
  globalIgnores(['dist', 'scripts']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Same as the TypeScript files: `_name` is unused on purpose, and
      // `{ photo: _photo, ...rest }` strips a field.
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },

  // The store layer is TypeScript.
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // TanStack Query's own rules: stable clients, exhaustive keys, no rest
  // destructuring of query results.
  pluginQuery.configs['flat/recommended'],

  { files: ['vite.config.js'], languageOptions: { globals: globals.node } },

  // Storefront pages and shared components: neither dashboard.
  {
    files: ['src/pages/**/*.{js,jsx}', 'src/components/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [TRANSPORT, SERVICES, DATA, ADMIN, CUSTOMER] }],
    },
  },

  // The admin never reaches into the customer dashboard or the storefront.
  {
    files: ['src/AdminDashboard/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [TRANSPORT, SERVICES, DATA, CUSTOMER, SITE] }],
    },
  },

  // The customer dashboard never reaches into the admin or the storefront.
  {
    files: ['src/CustomerDashboard/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [TRANSPORT, SERVICES, DATA, ADMIN, SITE] }],
    },
  },

  // Contexts sit beside the queries: they may call services, never screens.
  {
    files: ['src/store/context/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [DATA, ADMIN, CUSTOMER, SITE] }],
    },
  },

  // Query factories sit above services and below every screen.
  {
    files: ['src/store/tanstackStore/queries/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          DATA,
          { group: ['@/pages/**', '@/components/**', '@/AdminDashboard/**', '@/CustomerDashboard/**'],
            message: 'Queries know services, never screens.' },
        ],
      }],
    },
  },

  // The transport must stay ignorant of the domain and of React.
  {
    files: ['src/store/tanstackStore/services/api/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['react', 'react-*', '@/store/tanstackStore/services/**', '!@/store/tanstackStore/services/api/**',
                  '@/store/tanstackStore/queries/**', '@/store/context/**', '@/pages/*', '@/components/*'],
          message:
            'The transport (store/tanstackStore/services/api) is the bottom layer. Importing a service, a component or React inverts the dependency.',
        }],
      }],
    },
  },
])
