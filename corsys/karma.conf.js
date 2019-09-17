// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'es6-shim', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('@angular/cli/plugins/karma'),
      require('karma-htmlfile-reporter'),
      require('karma-es6-shim')
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'cobertura', 'text-summary'],
      dir: path.join(__dirname, 'testReport', 'coverage'),
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: false,
      'report-config': {
        html: {
          subdir: 'html'
        }
      },
      // enforce percentage thresholds
      // anything under these percentages will cause karma to fail with an exit code of 1 if not running in watch mode
      thresholds: {
        emitWarning: true, // set to `true` to not fail the test command when thresholds are not met
        global: { // thresholds for all files
          statements: 100,
          lines: 100,
          branches: 100,
          functions: 100
        }
      }
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'coverage-istanbul', 'html', 'junit'],
    htmlReporter: {
      outputFile: 'testReport/testReport.html',
      // Optional
      pageTitle: 'Corsys Test Results',
      subPageTitle: 'Corsys Unit Test Results',
      groupSuites: true,
      useCompactStyle: true,
      useLegacyStyle: true
    },
    junitReporter: {
      outputDir: 'testReport',
      outputFile: 'results.xml'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    captureTimeout: 60000,
    browserNoActivityTimeout: 100000,
    browsers: ['Chrome', 'PhantomJS', 'ChromeHeadless'],
    singleRun: false
  });
};
