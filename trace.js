const fspath = require('path');

const $handled = Symbol('handled');
const $normalized = Symbol('normalized');

/**
 * # Trace
 */
module.exports = ({ types, template }) => {
  const t = types;

  const PRESERVE_CONTEXTS = normalizeEnv(process.env.TRACE_CONTEXT);
  const PRESERVE_FILES = normalizeEnv(process.env.TRACE_FILE);
  const PRESERVE_LEVELS = normalizeEnv(process.env.TRACE_LEVEL);

  /**
   * Normalize an environment variable, used to override plugin options.
   */
  function normalizeEnv(input) {
    if (!input) {
      return [];
    }
    return input
      .split(/\s*,\s*/)
      .map(context => context.toLowerCase().trim())
      .filter(id => id);
  }

  /**
   * Like `template()` but returns an expression, not an expression statement.
   */
  function expression(input) {
    const fn = template(input, {
      placeholderPattern: /^(CONTENT|PREFIX|NAME)$/
    });
    return function(ids) {
      ids = Object.keys(ids).reduce((filteredIds, key) => {
        if (input.indexOf(key) > 0) {
          filteredIds[key] = ids[key];
        }
        return filteredIds;
      }, {});
      const node = fn(ids);
      return node.expression ? node.expression : node;
    };
  }

  /**
   * Normalize the plugin options.
   */
  function normalizeOpts(opts) {
    if (opts[$normalized]) {
      return opts;
    }
    Object.keys(opts.aliases).forEach(key => {
      if (typeof opts.aliases[key] === 'string' && opts.aliases[key]) {
        const expr = expression(opts.aliases[key]);
        opts.aliases[key] = message => expr(message);
      }
    });
    opts[$normalized] = true;
    return opts;
  }

  function generatePrefix(dirname, basename) {
    if (basename !== 'index') {
      return basename;
    }
    basename = fspath.basename(dirname);
    if (basename !== 'src' && basename !== 'lib') {
      return basename;
    }

    return fspath.basename(fspath.dirname(dirname));
  }

  /**
   * Collect the metadata for a given node path, which will be
   * made available to logging functions.
   */
  function collectMetadata(path, opts) {
    const filename = fspath.resolve(process.cwd(), path.hub.file.opts.filename);
    const dirname = fspath.dirname(filename);
    const extname = fspath.extname(filename);
    const basename = fspath.basename(filename, extname);
    const prefix = generatePrefix(dirname, basename);
    let indent = 0;
    let parent;

    const parentName = path
      .getAncestry()
      .slice(1)
      .reduce((parts, item) => {
        if (item.isClassMethod()) {
          if (!parent) {
            parent = item;
          }
          parts.unshift(
            item.node.key.type === 'Identifier'
              ? item.node.key.name
              : '[computed method]'
          );
        } else if (item.isClassDeclaration()) {
          if (!parent) {
            parent = item;
          }
          parts.unshift(
            item.node.id
              ? item.node.id.name
              : `[anonymous class@${item.node.loc.start.line}]`
          );
        } else if (item.isFunction()) {
          if (!parent) {
            parent = item;
          }
          parts.unshift(
            (item.node.id && item.node.id.name) ||
              `[anonymous@${item.node.loc.start.line}]`
          );
        } else if (item.isProgram()) {
          if (!parent) {
            parent = item;
          }
        } else if (!parent && !item.isClassBody() && !item.isBlockStatement()) {
          indent++;
        }
        return parts;
      }, [])
      .join(':');

    let hasStartMessage = false;
    let isStartMessage = false;
    if (parent && !parent.isProgram()) {
      for (let child of parent.get('body').get('body')) {
        if (child.node[$handled]) {
          hasStartMessage = true;
          break;
        }
        if (!child.isLabeledStatement()) {
          break;
        }
        const label = child.get('label');
        if (opts.aliases[label.node.name]) {
          hasStartMessage = true;
          if (child.node === path.node) {
            isStartMessage = true;
          }
          break;
        }
      }
    }

    const context = `${prefix}:${parentName}`;
    return {
      indent,
      prefix,
      parentName,
      context,
      hasStartMessage,
      isStartMessage,
      filename,
      dirname,
      basename,
      extname
    };
  }

  /**
   * Determine whether the given logging statement should be stripped.
   */
  function shouldStrip(name, metadata, opts) {
    if (!opts.strip) {
      return false;
    } else if (opts.strip === true) {
      return !hasStripOverride(name, metadata);
    } else if (typeof opts.strip === 'string') {
      if (opts.strip === process.env.NODE_ENV) {
        return !hasStripOverride(name, metadata);
      }
    } else if (opts.strip[process.env.NODE_ENV]) {
      return !hasStripOverride(name, metadata);
    }
    return true;
  }

  function hasStripOverride(name, metadata) {
    if (
      PRESERVE_CONTEXTS.length &&
      PRESERVE_CONTEXTS.some(
        context => metadata.context.toLowerCase().indexOf(context) !== -1
      )
    ) {
      return true;
    } else if (
      PRESERVE_FILES.length &&
      PRESERVE_FILES.some(
        filename => metadata.filename.toLowerCase().indexOf(filename) !== -1
      )
    ) {
      return true;
    } else if (
      PRESERVE_LEVELS.length &&
      PRESERVE_LEVELS.some(level => level === name.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  }

  return {
    visitor: {
      Program(program, { opts }) {
        program.traverse({
          LabeledStatement(path) {
            const label = path.get('label');
            opts = normalizeOpts(opts);
            if (!opts.aliases[label.node.name]) {
              return;
            }

            const metadata = collectMetadata(path, opts);
            if (shouldStrip(label.node.name, metadata, opts)) {
              path.remove();
              return;
            }

            path.traverse({
              ExpressionStatement(statement) {
                if (statement.node[$handled]) {
                  return;
                }

                const CONTENT = statement.get('expression').node;
                const message = {
                  CONTENT,
                  PREFIX: t.stringLiteral(
                    metadata.prefix + ':' + metadata.parentName
                  )
                  // hasStartMessage: t.booleanLiteral(metadata.hasStartMessage),
                  // isStartMessage: t.booleanLiteral(metadata.isStartMessage),
                  // indent: t.numericLiteral(metadata.indent),
                  // PARENT: t.stringLiteral()
                  // filename: t.stringLiteral(metadata.filename),
                  // dirname: t.stringLiteral(metadata.dirname),
                  // basename: t.stringLiteral(metadata.basename),
                  // extname: t.stringLiteral(metadata.extname)
                };
                if (CONTENT.name) {
                  message.NAME = t.stringLiteral(CONTENT.name);
                }
                const replacement = t.expressionStatement(
                  opts.aliases[label.node.name](message, metadata)
                );
                replacement[$handled] = true;
                statement.replaceWith(replacement);
              }
            });

            if (path.get('body').isBlockStatement()) {
              path.replaceWithMultiple(path.get('body').node.body);
            } else {
              path.replaceWith(path.get('body').node);
            }
          }
        });
      }
    }
  };
};
