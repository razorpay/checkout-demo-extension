#!/usr/bin/env node

const writeFileSync = require('fs').writeFileSync;
const glob = require('glob').sync;
const { exit, env } = require('process');
const { rollup } = require('rollup');
const { execSync } = require('child_process');

const { Collector, Reporter } = require('istanbul');
const coverage = require('rollup-plugin-coverage');
const puppeteer = require('puppeteer');
const { stylus, rollupCommon, getPlugins } = require('./cfu/rollup-plugins');
const rollupPlugins = getPlugins({
  src: 'app/modules',
  lint: false,
  watch: false,
}).concat(stylus);

const coveragePlugin = coverage({
  preserveComments: true,
  noCompact: true,
  noAutoWrap: true,
  include: 'app/modules/**/*.js',
  instrumenterConfig: {
    embedSource: true,
  },
});

let testCount = 0;
const distDir = 'app/dist/test';

execSync('mkdir -p ' + distDir);

const template = bundleName => `<meta charset='utf-8'>
<script src="../../../node_modules/testdouble/dist/testdouble.js"></script>
<script src="../../../test/tape.js"></script>
<script src="${bundleName}.js"></script>
<script>test.onFinish(testDone)</script>`;

let plugins = rollupPlugins.concat(coveragePlugin);

Promise.all(
  glob('test/*/*.js').map(
    input =>
      new Promise((resolve, reject) => {
        rollup({ input, plugins, ...rollupCommon })
          .then(bundle =>
            bundle.generate({
              format: 'iife',
              name: 'test',
            })
          )
          .then(async resp => {
            const { code } = resp.output[0];

            /**
             * input = "test/common/card.js"
             * bundleName = "test.common.card"
             */
            const bundleName = input
              .split('.')
              .slice(0, -1) // Remove "".js"
              .join('.')
              .replace(/\//g, '.'); // Turn slashes into dots

            testCount++;
            let prePath = `${distDir}/${bundleName}`;
            writeFileSync(prePath + '.js', code);
            writeFileSync(prePath + '.html', template(bundleName));

            const browser = await puppeteer.launch({
              // executablePath: env.CHROME_BIN || '/usr/bin/chromium',
              args: ['--no-sandbox'],
              // headless: false,
              // devtools: true,
            });
            const page = await browser.newPage();
            page.on('console', msg => {
              console.log(msg.text());
            });
            await page.exposeFunction('testDone', async _ => {
              let cov = await page.evaluate(
                'window.__coverage__ && JSON.stringify(window.__coverage__)'
              );
              browser.close();
              resolve(cov && JSON.parse(cov));
            });
            await page.goto(`file://${__dirname}/${prePath}.html`);
          });
      })
  )
)
  .then(coverages => {
    execSync('rm -rf coverage');
    if (coverages) {
      let collector = new Collector();
      let reporter = new Reporter(false, 'coverage/final');
      coverages.forEach(c => c && collector.add(c));

      // add `text` or `text-summary` reporter to report in console
      reporter.add('html');
      reporter.write(collector, true, _ => _);
    }
  })
  .catch(e => console.error(e));
