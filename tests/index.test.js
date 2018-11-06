/* globals test, expect, jest */
const {
  default: setupGoogleAnalytics,
  getDefaultProjectSetup,
  projectNames,
  gaAll,
} = require('../dist/js-lib-google-analytics.umd.min');

// const setupGoogleAnalytics = require('../src/index').default;

test('should throw error for missing config', () => {
  global.ga = jest.fn();

  expect(() => setupGoogleAnalytics()).toThrow(
    'Please provide a project configuration!'
  );
});

test('should throw error for missing `uaProjectId` in config', () => {
  global.ga = jest.fn();

  const config = getDefaultProjectSetup();

  expect(() => setupGoogleAnalytics(config)).toThrow(
    'Please provide a "uaProjectId"!'
  );
});

test('should setup a single google UA project (no autolink)', () => {
  global.ga = jest.fn();

  const config = {
    uaProjectId: '_UA_PROJECT_ID_',
    ...getDefaultProjectSetup(),
  };

  setupGoogleAnalytics(config);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should setup a single google UA project (with autolink)', () => {
  global.ga = jest.fn();

  const config = {
    uaProjectId: '_UA_PROJECT_ID_',
    ...getDefaultProjectSetup(),
    autoLink: ['www.domain1.at', 'www.domain2.at'],
  };

  setupGoogleAnalytics(config);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should setup two google UA project (with autolink)', () => {
  global.ga = jest.fn();

  const configs = [
    {
      uaProjectId: '_UA_PROJECT_ID_0_',
      ...getDefaultProjectSetup(),
      autoLink: ['www.domain1.at', 'www.domain2.at'],
    },
    {
      uaProjectId: '_UA_PROJECT_ID_1_',
      ...getDefaultProjectSetup(),
      autoLink: ['www.domain3.at', 'www.domain3.at'],
    },
  ];

  setupGoogleAnalytics(configs);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should setup a single UA project (without autotrack.js)', () => {
  global.ga = jest.fn();

  const config = {
    uaProjectId: '_UA_PROJECT_ID_',
    ...getDefaultProjectSetup(),
    autoTrack: null,
  };

  setupGoogleAnalytics(config);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should send an event for two configured projects', () => {
  global.ga = jest.fn();

  const configs = [
    {
      uaProjectId: '_UA_PROJECT_ID_0_',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: '_UA_PROJECT_ID_1_',
      ...getDefaultProjectSetup(),
    },
  ];

  setupGoogleAnalytics(configs);

  gaAll('send', 'pageview');

  expect(ga.mock.calls).toMatchSnapshot();
});

// test('should output two project names', () => {
//   global.ga = jest.fn();

//   const configs = [
//     {
//       uaProjectId: '_UA_PROJECT_ID_0_',
//       ...getDefaultProjectSetup(),
//     },
//     {
//       uaProjectId: '_UA_PROJECT_ID_1_',
//       ...getDefaultProjectSetup(),
//     },
//   ];

//   setupGoogleAnalytics(configs);

//   expect(projectNames).toMatchSnapshot();
// });