module.exports = {
  extends: '@wittcode/eslint-config',
  //  add space for your own configuration
  "rules": {
    // enable additional rules
    "indent": ["error", 4],
    "linebreak-style": ["error", "unix"],
    "quotes": ["warn", "semi"],
    "semi": ["warn", "always"],

    // override default options for rules from base configurations
    "comma-dangle": ["warn", "always"],
    "no-cond-assign": ["warn", "always"],

    // disable rules from base configurations
    "no-console": "off",
    // trailing comma
    "comma-dangle": ["error", "always-multiline"],
  }
};