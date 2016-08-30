'use strict'

let capabilities = [
  {
    os: 'OS X',
    os_version: 'El Capitan',
    browser: 'chrome',
  },
  {
    os: 'OS X',
    os_version: 'El Capitan',
    browser: 'Firefox',
  },
  {
    os: 'WINDOWS',
    os_version: 8.1,
    browser: 'chrome',
  },
  {
    os: 'WINDOWS',
    os_version: 8.1,
    browser: 'Firefox',
  }
]

capabilities.forEach((capability) => {
  capability.maxInstances = 1
  capability['browserstack.local'] = true
  capability['browserstack.debug'] = true
  capability['browserstack.autoWait'] = 0
})

module.exports = capabilities
