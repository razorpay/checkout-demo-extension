const prefixStyle =
  'background: #222; color: #bada55; border-radius: 3px; font-size: 10px; padding:2px 4px';

const consoleAliases = {};

// aliases available to babel-plugin-trace
const simpleCommands = ['time', 'timeEnd', 'table', 'assert', 'trace'];

// these console commands will get invoking filename and function name prefixed
const prefixedCommands = ['log', 'info', 'warn', 'error'];

simpleCommands.forEach(
  command => (consoleAliases[command] = `console.${command}(CONTENT, PREFIX);`)
);
prefixedCommands.forEach(
  command =>
    (consoleAliases[
      command
    ] = `console.${command}('%c' + PREFIX, '${prefixStyle}', CONTENT);`)
);

if (process.env.NODE_ENV !== 'production') {
  consoleAliases.expose = `window[NAME] = CONTENT;`;
}

// export to pass as "pure functions" to uglify in gulpfile
module.exports = {
  pure_funcs: simpleCommands.concat(prefixedCommands).map(c => 'console.' + c),
  aliases: consoleAliases
};
