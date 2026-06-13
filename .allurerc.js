/** @type {import('allure-js-commons').AllureConfig} */
module.exports = {
  resultsDir: 'allure-results',
  reportDir: 'allure-report',
  categories: [
    {
      name: 'Ignored tests',
      matchedStatuses: ['skipped'],
    },
    {
      name: 'Infrastructure problems',
      messageRegex: '.*Connection refused.*|.*timeout.*',
      matchedStatuses: ['broken'],
    },
    {
      name: 'Flaky tests',
      matchedStatuses: ['failed'],
      flaky: true,
    },
  ],
};
