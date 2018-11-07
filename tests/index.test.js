/* globals test, expect, jest */
const {
  default: setupGoogleAnalytics,
  getDefaultProjectSetup,
  getProjectNames,
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
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
  };

  setupGoogleAnalytics(config);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should setup a single google UA project (with autolink)', () => {
  global.ga = jest.fn();

  const config = {
    uaProjectId: 'UA-PROJECT-ID',
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
      uaProjectId: 'UA-PROJECT-ID-0',
      ...getDefaultProjectSetup(),
      autoLink: ['www.domain1.at', 'www.domain2.at'],
    },
    {
      uaProjectId: 'UA-PROJECT-ID-1',
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
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
    autoTrack: null,
  };

  setupGoogleAnalytics(config);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should setup a single UA project with a `userId`', () => {
  global.ga = jest.fn();

  const config = {
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
    userId: 'my-user-id',
    autoTrack: null,
  };

  setupGoogleAnalytics(config);

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should send an event for two configured projects', () => {
  global.ga = jest.fn();

  const configs = [
    {
      uaProjectId: 'UA-PROJECT-ID-0',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-1',
      ...getDefaultProjectSetup(),
    },
  ];

  setupGoogleAnalytics(configs);

  gaAll('send', 'pageview');

  expect(ga.mock.calls).toMatchSnapshot();
});

test('should return two project names as an array', () => {
  global.ga = jest.fn();

  // Setup some projects before to see if they get correctly cleared out
  // with the following `setupGoogleAnalytics()` call:
  setupGoogleAnalytics([
    {
      uaProjectId: 'UA-PROJECT-ID-3',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-4',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-7',
      ...getDefaultProjectSetup(),
    }
  ]);
  
  const configs = [
    {
      uaProjectId: 'UA-PROJECT-ID-0',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-1',
      ...getDefaultProjectSetup(),
    },
  ];

  setupGoogleAnalytics(configs);

  expect(getProjectNames({ asArray: true })).toMatchSnapshot();
});

test('should return two project names as a set', () => {
  global.ga = jest.fn();

  // Setup some projects before to see if they get correctly cleared out
  // with the following `setupGoogleAnalytics()` call:
  setupGoogleAnalytics([
    {
      uaProjectId: 'UA-PROJECT-ID-3',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-4',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-7',
      ...getDefaultProjectSetup(),
    }
  ]);

  const configs = [
    {
      uaProjectId: 'UA-PROJECT-ID-0',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-1',
      ...getDefaultProjectSetup(),
    },
  ];

  setupGoogleAnalytics(configs);

  expect(getProjectNames()).toMatchSnapshot();
});

test('should return two custom project names as a set', () => {
  global.ga = jest.fn();

  // Setup some projects before to see if they get correctly cleared out
  // with the following `setupGoogleAnalytics()` call:
  setupGoogleAnalytics([
    {
      uaProjectId: 'UA-PROJECT-ID-3',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-4',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-7',
      ...getDefaultProjectSetup(),
    }
  ]);

  const configs = [
    {
      uaProjectId: 'UA-PROJECT-ID-0',
      name: 'MyTracker0',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-1',
      name: 'MyTracker1',
      ...getDefaultProjectSetup(),
    },
  ];

  setupGoogleAnalytics(configs);

  expect(getProjectNames()).toMatchSnapshot();
});

test('should send events to two projects with custom names', () => {
  global.ga = jest.fn();

  // Setup some projects before to see if they get correctly cleared out
  // with the following `setupGoogleAnalytics()` call:
  setupGoogleAnalytics([
    {
      uaProjectId: 'UA-PROJECT-ID-3',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-4',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-7',
      ...getDefaultProjectSetup(),
    }
  ]);

  const configs = [
    {
      uaProjectId: 'UA-PROJECT-ID-0',
      name: 'MyTracker0',
      ...getDefaultProjectSetup(),
    },
    {
      uaProjectId: 'UA-PROJECT-ID-1',
      name: 'MyTracker1',
      ...getDefaultProjectSetup(),
    },
  ];

  setupGoogleAnalytics(configs);
  gaAll('send', 'pageview');

  expect(ga.mock.calls).toMatchSnapshot();
});