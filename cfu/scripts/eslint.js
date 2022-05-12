const chokidar = require('chokidar');
const lintRules = require('./eslintrc');
const CLIEngine = require('eslint').ESLint;

const eslint = new CLIEngine(lintRules);
const eslintFormatter = eslint.loadFormatter('stylish');

/**
 * Fixes ESLint issues
 * @param {Array<string>} paths
 */
const lintFix = (paths) => {
  const fixer = new CLIEngine({
    ...lintRules,
    fix: true,
  });

  const report = fixer.lintFiles(paths);

  CLIEngine.outputFixes(report);
};

const lintPaths = async (paths) => {
  if (!Array.isArray(paths)) {
    if (!paths.endsWith('.js')) {
      return;
    }
    paths = [paths];
  }
  lintLog(await eslint.lintFiles(paths));
};

const lintLog = async (report) => {
  const formatter = await eslintFormatter;
  const results = formatter.format(report);

  if (results) {
    console.log(results);
  }
};
const lint = (isWatching) => (paths) => {
  // exclude node_modules from being linted
  paths = paths.filter((p) => !p.startsWith('node_modules'));

  lintPaths(paths);

  if (isWatching) {
    chokidar
      .watch(paths, {
        ignoreInitial: true,
      })
      .on('add', lintPaths)
      .on('change', lintPaths);
  }
};

const lintText = async (text, id) => lintLog(await eslint.lintText(text, id));

module.exports = {
  lint,
  lintFix,
  lintLog,
  lintText,
};
