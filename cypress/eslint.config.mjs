// eslint.config.mjs
import cypress from "eslint-plugin-cypress";

export default [
  {
    plugins: { cypress },
    extends: ["plugin:cypress/recommended"],
    rules: {
      "cypress/unsafe-to-chain-command": "off",
      "cypress/no-unnecessary-waiting": "off",
    },
  },
];
