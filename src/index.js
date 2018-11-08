/* globals window, self */

let _retries = 0;
let _projectNames = new Set();

/**
 * NOTE: deprecated, use getDefaultProjectConfig()!
 */
function getDefaultProjectSetup() {
  return {
    temporarySession: false,
    anonymizeIp: true,
    userId: null,
    clientId: null,
    autoLink: [],
    sendInitialPageView: true,
    autoTrack: {
      cleanUrlTracker: {
        stripQuery: true,
        queryDimensionIndex: 1,
        indexFilename: 'index.html',
        trailingSlash: 'remove',
      },
      urlChangeTracker: true,
    },
  };
}

function getDefaultProjectConfig() {
  return {
    temporarySession: false,
    anonymizeIp: true,
    userId: null,
    clientId: null,
    autoLink: [],
    sendInitialPageView: true,
    autoTrack: {
      cleanUrlTracker: {
        stripQuery: true,
        queryDimensionIndex: 1,
        indexFilename: 'index.html',
        trailingSlash: 'remove',
      },
      urlChangeTracker: true,
    },
  };
}

export { getDefaultProjectSetup, getDefaultProjectConfig };

function createProjectConfig({
  uaProjectIds,
  clientId,
  useSessionCookie = false,
}) {
  const projectIds = Array.isArray(uaProjectIds)
    ? uaProjectIds
    : [uaProjectIds];

  const configs = projectIds.map(projectId => {
    return {
      uaProjectId: projectId,
      ...getDefaultProjectConfig(),
      temporarySession: useSessionCookie,
      clientId,
    };
  });

  return configs;
}

export { createProjectConfig };

function setupProject(config) {
  const ga = window.ga || self.ga;
  const {
    uaProjectId,
    name = null,
    cookieName,
    anonymizeIp = true,
    userId = null,
    clientId = null,
    // clientIdIfNewCookie = null,
    temporarySession = false,
    autoLink = [],
    sendInitialPageView = true,
  } = config;
  // NOTE: allow passing in of `autoTrack: null || false` in the config object:
  const {
    cleanUrlTracker = null,
    pageVisibilityTracker = null,
    urlChangeTracker = null,
  } = config.autoTrack || {};

  if (!uaProjectId) {
    throw new Error('Please provide a "uaProjectId"!');
  }

  const projectName = name ? name : uaProjectId.replace(/-/g, '');
  const allowLinker = autoLink && autoLink.length ? true : false;

  if (ga) {
      _doSetup({
        uaProjectId,
        projectName,
        cookieName,
        allowLinker,
        anonymizeIp,
        userId,
        clientId,
        // clientIdIfNewCookie,
        temporarySession,
        autoLink,
        sendInitialPageView,
        cleanUrlTracker,
        pageVisibilityTracker,
        urlChangeTracker,
      });
  } else {
    if (_retries < 3) {
      setTimeout(function() {
        setupProject(config);
      }, 1000);

      _retries += 1;
    } else {
      throw new Error(
        'Global "ga" object not available. Please check how to enable it here: https://developers.google.com/analytics/devguides/collection/analyticsjs/'
      );
    }
  }
}

function _doSetup({
  uaProjectId,
  projectName,
  cookieName,
  allowLinker,
  anonymizeIp,
  userId,
  clientId,
  // clientIdIfNewCookie,
  temporarySession,
  autoLink,
  sendInitialPageView,
  cleanUrlTracker,
  pageVisibilityTracker,
  urlChangeTracker,
}) {
  // NOTE: if this is a session cookie alter the name, because an existing tracker setup can't be re-initialized
  // with the same name, e.g. if a call to `setupGoogleAnalytics` with a permanent cookie happens in the same session:
  const name = temporarySession ? `${projectName}session` : projectName;

  let createOpts = {
    name,
    allowLinker,
    cookieExpires: 31536000, // NOTE: 1 year, to be compliant with GDPR
  };

  if (cookieName) {
    createOpts.cookieName = cookieName;
  }

  // NOTE: see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#cookie_expiration
  if (temporarySession) {
    createOpts.cookieExpires = 0;
    createOpts.cookieName = cookieName ? cookieName : '_ga-zero';
  }

  // // NOTE: If no cookie was set before and `clientIdIfNewCookie` is present set it as the `clientId`.
  // if (clientIdIfNewCookie) {
  //   createOpts.clientId = clientIdIfNewCookie;
  // }

  // NOTE: a given `clientId` will trump:
  if (clientId) {
    createOpts.clientId = clientId;
  }

  if (userId) {
    createOpts.userId = userId;
  }

  ga('create', uaProjectId, 'auto', createOpts);

  _projectNames.add(name);

  ga(`${name}.set`, 'anonymizeIp', anonymizeIp);

  // See https://www.optimizesmart.com/using-multiple-trackers-for-cross-domain-tracking-in-universal-analytics/
  // on how to link multiple domains within a single GA project:
  if (allowLinker) {
    ga(`${name}.require`, 'linker');
    ga(`${name}.linker:autoLink`, autoLink);
  }

  // NOTE: see https://github.com/googleanalytics/autotrack for plugins and config options

  cleanUrlTracker &&
    ga(`${name}.require`, 'cleanUrlTracker', cleanUrlTracker);

  // NOTE: see https://github.com/googleanalytics/autotrack/blob/master/docs/plugins/page-visibility-tracker.md#setting-custom-metrics-to-track-time-spent-in-the-hidden-and-visible-states
  pageVisibilityTracker &&
    ga(
      `${name}.require`,
      'pageVisibilityTracker',
      pageVisibilityTracker
    );

  // NOTE: see https://github.com/googleanalytics/autotrack/blob/master/docs/plugins/url-change-tracker.md#differentiating-between-virtual-pageviews-and-the-initial-pageview
  urlChangeTracker && ga(`${name}.require`, 'urlChangeTracker');

  if (sendInitialPageView) {
    ga(`${name}.send`, 'pageview');
  }
}
export default function setupGoogleAnalytics(configs) {
  if (!configs) {
    throw new Error('Please provide a project configuration!');
  }

  _projectNames.clear();

  Array.isArray(configs) ? configs.map(setupProject) : setupProject(configs);
}

export function gaAll(param1, param2, param3) {
  _projectNames.forEach(projectName => {
    ga(`${projectName}.${param1}`, param2, param3);
  });
}

export function getProjectNames({ asArray = true } = {}) {
  return asArray ? Array.from(_projectNames) : _projectNames;
}
