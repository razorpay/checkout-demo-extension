module.exports = {
  extends: "stylelint-config-standard",
  rules: {
    // override anyrules if required. Tag the team for review before whitelisting any extra rule (as this affects the style guide we follow)
    "no-missing-eof-newline": null,
    "number-leading-zero": null,
    "color-hex-case": null
  }
};
