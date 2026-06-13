const common = {
  require: ['src/fixtures/CustomWorld.ts', 'steps/**/*.ts'],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar',
    'allure-cucumberjs/reporter',
    'json:allure-results/cucumber-report.json',
  ],
  formatOptions: {
    resultsDir: 'allure-results',
  },
};

module.exports = {
  default: {
    ...common,
    paths: ['features/**/*.feature'],
  },
  ui: {
    ...common,
    paths: ['features/ui/**/*.feature'],
    tags: 'not @skip',
  },
  api: {
    ...common,
    paths: ['features/api/**/*.feature'],
    tags: 'not @skip',
  },
  smoke: {
    ...common,
    paths: ['features/**/*.feature'],
    tags: '@smoke and not @skip and not @flaky',
  },
  parallel: {
    ...common,
    paths: ['features/**/*.feature'],
    parallel: parseInt(process.env.WORKERS || '4'),
    tags: 'not @skip',
  },
};
