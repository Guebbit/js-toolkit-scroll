import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

export default tseslint.config(
  /**
   * Excluded files
   */
  {
    ignores: [
      'dist',
      'node_modules',
      // Config files that sit outside the TypeScript program, so the
      // type-aware rules have no types to run against.
      'eslint.config.mjs',
      'vitest.config.mts',
      'cypress.config.ts',
      '.commitlintrc.js',
      'cypress',
      'docs',
      'reports',
      '.stryker-tmp'
    ]
  },

  /**
   * Base eslint
   */
  eslint.configs.recommended,

  /**
   * Typescript presets
   */
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  /**
   * Unicorn plugin
   */
  eslintPluginUnicorn.configs['flat/recommended'],

  /**
   * Global parser + dedicated eslint tsconfig
   */
  {
    languageOptions: {
      parserOptions: {
        // projectService: true, this would create problems with tests, better to use a specific tsconfig
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      }
    }
  },

  /**
   * All global rules
   */
  {
    plugins: {
      // html, // import html from 'eslint-plugin-html';
      // unicorn: eslintPluginUnicorn
    },

    languageOptions: {
      globals: {
        ...globals.browser
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },

    rules: {
      /**
       * Some generic rules that don't require explanations or guides
       */
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-nested-ternary': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/prefer-top-level-await': 'off',

      /**
       *
       */
      '@typescript-eslint/restrict-plus-operands': [
        'error',
        {
          allowNumberAndString: true
        }
      ],

      /**
       * Naming conventions for everything and
       * then some specifications based on type of the element
       */
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        {
          selector: ['class', 'typeLike', 'typeParameter', 'enum'],
          format: ['PascalCase']
        },
        {
          selector: ['function'],
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'interface',
          format: ['PascalCase'],

          custom: {
            regex: '^I[A-Z]',
            match: true
          }
        },
        {
          selector: 'enum',
          format: ['PascalCase'],

          custom: {
            regex: '^E[A-Z]',
            match: true
          }
        },
        {
          selector: ['memberLike', 'enumMember'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        }
      ],

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-destructuring.md
      'unicorn/better-regex': 'warn',

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/better-regex.md
      'unicorn/consistent-destructuring': 'warn',

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/filename-case.md
      'unicorn/filename-case': [
        'error',
        {
          case: 'camelCase'
        }
      ],

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/catch-error-name.md
      'unicorn/catch-error-name': [
        'error',
        {
          name: 'error'
        }
      ],

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prevent-abbreviations.md
      'unicorn/prevent-abbreviations': [
        'error',
        {
          replacements: {
            i: false,
            e: false,
            len: false,
            prop: false,
            props: false,
            opts: {
              options: true
            },
            ref: {
              reference: false
            }
          }
        }
      ],

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/string-content.md
      // 'unicorn/string-content': [
      //     'error',
      //     {
      //         'patterns': {
      //             'unicorn': '🦄',
      //             'awesome': {
      //                 'suggest': '😎',
      //                 'message': 'Please use `😎` instead of `awesome`.'
      //             },
      //             'cool': {
      //                 'suggest': '😎',
      //                 'fix': false
      //             }
      //         }
      //     }
      // ],

      // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-anonymous-default-export.md
      // Understandable but a pain to follow
      'unicorn/no-anonymous-default-export': 'off'
    }
  },

  /**
   * "Special" files names are better to be left untouched
   */
  {
    files: ['tests/**/*', '**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
    rules: {
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off'
    }
  },

  /**
   * Tests specific eslint config
   */
  {
    files: ['tests/**/*', '**/*.spec.ts', '**/*.test.ts'],

    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.eslint.json',
          './tsconfig.tests.json'
        ]
      },
      globals: {
        ...globals.jest
      }
    }
  },

  /**
   * Node scripts.
   *
   * These are plain .mjs, so they are outside the TypeScript program and the
   * type-aware rules have no types to reason about — they report every value as
   * `any` rather than finding anything.
   */
  {
    files: ['scripts/**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off'
    }
  },

  /**
   * Tests.
   *
   * Test code exercises the arguments the library has to survive, so the rules
   * that steer production code away from them get in the way here:
   *
   * - no-null: passing null is the contract being tested.
   * - prefer-dom-node-dataset: these tests assert on the raw attributes the
   *   library moves, and .dataset would hide the very thing under test.
   * - no-confusing-void-expression: the shorthand `() => expect(...)` body is
   *   the standard form for a one-line assertion.
   * - consistent-function-scoping: per-suite helpers belong beside their suite.
   */
  {
    files: ['tests/**/*.ts'],
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-sort': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off'
    }
  }
)
