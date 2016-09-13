const minimist = require('minimist')

const argv = minimist(process.argv.slice(1));
const isProduction = argv.env === 'production';
const isCrossBrowserTesting = argv.type === 'crossbrowsertesting';

const wdioConfig = {
  debug: isProduction ? false : true,
  // =====================
  // Server Configurations
  // =====================
  // Host address of the running Selenium server. This information is usually obsolete as
  // WebdriverIO automatically connects to localhost. Also if you are using one of the
  // supported cloud services like Sauce Labs, Browserstack or Testing Bot you also don't
  // need to define host and port information because WebdriverIO can figure that our
  // according to your user and key information. However if you are using a private Selenium
  // backend you should define the host address, port, and path here.
  //
  host: '0.0.0.0',
  port: 4444,
  path: '/wd/hub',
  //
  // =================
  // Service Providers
  // =================
  // WebdriverIO supports Sauce Labs, Browserstack and Testing Bot (other cloud providers
  // should work too though). These services define specific user and key (or access key)
  // values you need to put in here in order to connect to these services.
  //
  // user: 'webdriverio',
  // key:  'xxxxxxxxxxxxxxxx-xxxxxx-xxxxx-xxxxxxxxx',
  //
  // ==================
  //// Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: [
    'test/e2e/specs/**/**.spec.js'
    // 'test/e2e/specs/web-integration/manual-checkout.spec.js'
    // 'test/e2e/specs/web-integration/automatic-checkout.spec.js',
    // 'test/e2e/specs/card-payment.spec.js',
    // 'test/e2e/specs/netbanking.spec.js',
    // 'test/e2e/specs/kyc.spec.js',
    // 'test/e2e/specs/validation.spec.js',
  ],
  // Patterns to exclude.
  // exclude: [
  //     'test/spec/multibrowser/**',
  //     'test/spec/mobile/**'
  // ],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude option in
  // order to group specific specs to a specific capability.
  //
  // First you can define how many instances should be started at the same time. Let's
  // say you have 3 different capabilities (Chrome, Firefox and Safari) and you have
  // set maxInstances to 1, wdio will spawn 3 processes. Therefor if you have 10 spec
  // files and you set maxInstances to 10, all spec files will get tested at the same time
  // and 30 processes will get spawned. The property basically handles how many capabilities
  // from the same test should run tests.
  //
  //
  // maxInstances: 1,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: [{
    browserName: isProduction ? 'firefox' : 'chrome',
    maxInstances: isProduction ? 10 : 1,
    chromeOptions: {
      args: [
        'no-sandbox',
        'no-gpu'
      ]
    },
    firefox_binary: `${process.cwd()}/scripts/firefox.sh`,
    firefox_profile: {
      'browser.startup.homepage_override.mstone': 'ignore',
      'startup.homepage_welcome_url.additional': 'about:blank'
    }
  }],
  // , {
  // maxInstances can get overwritten per capability. So if you have an in house Selenium
  // grid with only 5 firefox instance available you can make sure that not more than
  // 5 instance gets started at a time.
  //     maxInstances: 5,
  //     browserName: 'firefox',
  //     specs: [
  //         'test/ffOnly/*'
  //     ]
  // },{
  //     browserName: 'phantomjs',
  //     exclude: [
  //         'test/spec/alert.js'
  //     ]
  // }],
  //
  //
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Per default WebdriverIO commands getting executed in a synchronous way using
  // the wdio-sync package. If you still want to run your tests in an async way
  // using promises you can set the sync command to false.
  sync: true,
  //
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: isProduction ? 'error' : 'verbose',
  //
  // Enables colors for log output.
  coloredLogs: true,
  //
  // Saves a screenshot to a given path if a command fails.
  screenshotPath: 'shots',
  //
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  //  with "/", the base url gets prepended.
  // baseUrl: "http://192.168.0.23:3000",
  //
  // Default timeout for all waitForXXX commands.
  waitforTimeout: 20000,
  //
  // Initialize the browser instance with a WebdriverIO plugin. The object should have the
  // plugin name as key and the desired plugin options as property. Make sure you have
  // the plugin installed before running any tests. The following plugins are currently
  // available:
  // WebdriverCSS: https://github.com/webdriverio/webdrivercss
  // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
  // Browserevent: https://github.com/webdriverio/browserevent
  plugins: {
    // webdrivercss: {
    //     screenshotRoot: 'my-shots',
    //     failedComparisonsRoot: 'diffs',
    //     misMatchTolerance: 0.05,
    //     screenWidth: [320,480,640,1024]
    // },
    // webdriverrtc: {},
    // browserevent: {}
  },
  //
  // Framework you want to run your specs with.
  // The following are supported: mocha, jasmine and cucumber
  // see also: http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the wdio adapter package for the specific framework installed before running any tests.
  framework: 'mocha',
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: http://webdriver.io/guide/testrunner/reporters.html
  reporters: ['dot', 'spec'],
  //
  // Some reporter require additional information which should get defined here
  reporterOptions: {
    //
    // If you are using the "xunit" reporter you should define the directory where
    // WebdriverIO should save all unit reports.
    outputDir: './'
  },
  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: 72000000
  },
  //
  // Options to be passed to Jasmine.
  // See also: https://github.com/webdriverio/wdio-jasmine-framework#jasminenodeopts-options
  // jasmineNodeOpts: {
  //     //
  //     // Jasmine default timeout
  //     defaultTimeoutInterval: 5000,
  //     //
  //     // The Jasmine framework allows it to intercept each assertion in order to log the state of the application
  //     // or website depending on the result. For example it is pretty handy to take a screenshot every time
  //     // an assertion fails.
  //     expectationResultHandler: function(passed, assertion) {
  //         // do something
  //     },
  //     //
  //     // Make use of Jasmine-specific grep functionality
  //     grep: null,
  //     invertGrep: null
  // },
  //
  // If you are using Cucumber you need to specify where your step definitions are located.
  // See also: https://github.com/webdriverio/wdio-cucumber-framework#cucumberopts-options
  // cucumberOpts: {
  //     require: [],        // <string[]> (file/dir) require files before executing features
  //     backtrace: false,   // <boolean> show full backtrace for errors
  //     compiler: [],       // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
  //     dryRun: false,      // <boolean> invoke formatters without executing steps
  //     failFast: false,    // <boolean> abort the run on first failure
  //     format: ['pretty'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
  //     colors: true,       // <boolean> disable colors in formatter output
  //     snippets: true,     // <boolean> hide step definition snippets for pending steps
  //     source: true,       // <boolean> hide source URIs
  //     profile: [],        // <string[]> (name) specify the profile to use
  //     strict: false,      // <boolean> fail if there are any undefined or pending steps
  //     tags: [],           // <string[]> (expression) only execute the features or scenarios with tags matching the expression
  //     timeout: 20000      // <number> timeout for step definitions
  //     ignoreUndefinedDefinitions: false, // <boolean> Enable this config to treat undefined definitions as warnings.
  // },
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides a several hooks you can use to interfere the test process in order to enhance
  // it and build services around it. You can either apply a single function to it or an array of
  // methods. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  //
  // Gets executed once before all workers get launched.
  onPrepare: function(config, capabilities) {
    console.log('LET\'S GO')
  },
  //
  // Gets executed before test execution begins. At this point you can access to all global
  // variables like `browser`. It is the perfect place to define custom commands.
  before: function(capabilities, specs) {
    var chai = global.chai = require('chai');
    global.expect = chai.expect;
    global.assert = chai.assert;

    var browserCommands = require('./test/e2e/helpers/browser-commands');
    for (var command in browserCommands) {
      browser.addCommand(command, browserCommands[command]);
    }

    global.$ = function(selector) {
      return browser.element(selector).value
    }

    // http://webdriver.io/api/protocol/execute.html
    global.execOnFrame = function() {
      browser.checkoutFrame();
      return browser.execute.apply(browser, arguments).value;
    }
  },
  //
  // Hook that gets executed before the suite starts
  beforeSuite: function(suite) {},
  //
  // Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
  // beforeEach in Mocha)
  beforeHook: function() {},
  //
  // Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
  // afterEach in Mocha)
  afterHook: function() {},
  //
  // Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
  beforeTest: function(test) {},
  //
  // Runs before a WebdriverIO command gets executed.
  beforeCommand: function(commandName, args) {},
  //
  // Runs after a WebdriverIO command gets executed
  afterCommand: function(commandName, args, result, error) {},
  //
  // Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
  afterTest: function(test) {},
  //
  // Hook that gets executed after the suite has ended
  afterSuite: function(suite) {},
  //
  // Gets executed after all tests are done. You still have access to all global variables from
  // the test.
  after: function(result, capabilities, specs) {},
  //
  // Gets executed after all workers got shut down and the process is about to exit. It is not
  // possible to defer the end of the process using a promise.
  onComplete: function(exitCode) {
    if (exitCode === 0) {
      console.log(`
              _/_/    _/        _/            _/_/_/    _/_/_/      _/          _/  _/_/_/_/  _/        _/
           _/    _/  _/        _/              _/    _/            _/          _/  _/        _/        _/
          _/_/_/_/  _/        _/              _/      _/_/        _/    _/    _/  _/_/_/    _/        _/
         _/    _/  _/        _/              _/          _/        _/  _/  _/    _/        _/        _/
        _/    _/  _/_/_/_/  _/_/_/_/      _/_/_/  _/_/_/            _/  _/      _/_/_/_/  _/_/_/_/  _/_/_/_/
      `)
    } else {
      console.log(`${exitCode} :-|
        ()
        /\                 _/_ /                           /)       /
       /  )  __ ______  _  /  /_  o ____  _,    o _       // o _   /_  __  ,
      /__/__(_)/ / / <_</_<__/ /_<_/ / <_(_)_  <_/_)_    //_<_/_)_/ /_/ (_/_
                                          /|            />               /
                                         |/            </               '
      `)
    }
  },
  //
  // Cucumber specific hooks
  beforeFeature: function(feature) {},
  beforeScenario: function(scenario) {},
  beforeStep: function(step) {},
  afterStep: function(stepResult) {},
  afterScenario: function(scenario) {},
  afterFeature: function(feature) {}
};

if (isCrossBrowserTesting) {
  Object.assign(wdioConfig, {
    host: 'hub-cloud.browserstack.com',
    port: 80,
    services: ['browserstack'],
    browserstackLocal: true,
    user: process.env.BS_USER,
    key: process.env.BS_KEY,
    capabilities: require('./wdio-bs-capabilities')
  });
}

exports.config = wdioConfig;
