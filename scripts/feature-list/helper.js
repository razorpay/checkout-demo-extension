const acorn = require('acorn');
const { readFileSync } = require('fs');

const ast = acorn.parse(
  String(readFileSync('app/modules/analytics/feature-track/evaluators.js')),
  {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }
).body;

const envs = ast
  .find(
    (node) =>
      node.type === 'VariableDeclaration' &&
      node.declarations[0].id.name === 'envs'
  )
  .declarations[0].init.elements.map((e) => e.id.name);

const methods = ast
  .find(
    (node) =>
      node.type === 'VariableDeclaration' &&
      node.declarations[0].id.name === 'methods'
  )
  .declarations[0].init.elements.map((e) => e.id.name);

const features = ast
  .find((node) => node.type === 'ExportDefaultDeclaration')
  .declaration.elements.filter((node) => node.type === 'FunctionExpression')
  .map((e) => e.id.name);

module.exports = {
  envs,
  methods,
  features,
  all: [...methods, ...envs, ...features],
};
