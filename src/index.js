/* globals window, self */

let retries = 0;

function getDefaultProjectSetup() {
  return {
    temporarySession: false,
    anonymizeIp: true,
    autoLink: [],
    sendInitialPageView: true,
    autoTrack: {
      cleanUrlTracker: {
        stripQuery: true,
        queryDimensionIndex: 1,
        indexFilename: 'index.html',
        trailingSlash: 'remove',
      },
      pageVisibilityTracker: {
        fieldsObj: {
          nonInteraction: null,
        },
      },
      urlChangeTracker: true,
    },
  };
}

export { getDefaultProjectSetup };

function setupProject(config) {
  const ga = window.ga || self.ga;
  const {
    uaProjectId,
    anonymizeIp = true,
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

  const projectName = `${uaProjectId}`;
  const allowLinker = autoLink && autoLink.length ? true : false;

  if (ga) {
    ga(tracker => {
      console.log('[js-lib-google-analytics::setupProject] tracker:', tracker);
      console.log('[js-lib-google-analytics::setupProject] temporarySession:', temporarySession);

      let createOpts = {
        name: projectName,
        allowLinker,
      };

      // NOTE: see https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#cookie_expiration
      if (temporarySession) {
        createOpts.cookieExpires = 0;
        console.log('[js-lib-google-analytics::setupProject] cookieEpires = 0');
      } else {
        // NOTE: after creating a temporary session and calling setupProject() again (e.g. if the user clicked on accept cookies)
        // the clientId of the temporary session is reused:
        const clientId = tracker.get('clientId');

        console.log('[js-lib-google-analytics::setupProject] clientId:', clientId);

        if (clientId) {
          createOpts.clientId = clientId;
        }
      }

      console.log('[js-lib-google-analytics::setupProject] createOpts:', createOpts);

      ga('create', uaProjectId, 'auto', createOpts);

      ga(`${projectName}.set`, 'anonymizeIp', anonymizeIp);

      // See https://www.optimizesmart.com/using-multiple-trackers-for-cross-domain-tracking-in-universal-analytics/
      // on how to link multiple domains within a single GA project:
      if (allowLinker) {
        ga(`${projectName}.require`, 'linker');
        ga(`${projectName}.linker:autoLink`, autoLink);
      }

      // NOTE: see https://github.com/googleanalytics/autotrack for plugins and config options

      cleanUrlTracker &&
        ga(`${projectName}.require`, 'cleanUrlTracker', cleanUrlTracker);

      // NOTE: see https://github.com/googleanalytics/autotrack/blob/master/docs/plugins/page-visibility-tracker.md#setting-custom-metrics-to-track-time-spent-in-the-hidden-and-visible-states
      pageVisibilityTracker &&
        ga(
          `${projectName}.require`,
          'pageVisibilityTracker',
          pageVisibilityTracker
        );

      // NOTE: see https://github.com/googleanalytics/autotrack/blob/master/docs/plugins/url-change-tracker.md#differentiating-between-virtual-pageviews-and-the-initial-pageview
      urlChangeTracker && ga(`${projectName}.require`, 'urlChangeTracker');

      if (sendInitialPageView) {
        // ga(`${projectName}.set`, 'checkProtocolTask', null);
        ga(`${projectName}.send`, 'pageview');
      }
    });
  } else {
    if (retries < 3) {
      setTimeout(function() {
        setupProject(config);
      }, 1000);

      retries += 1;
    } else {
      throw new Error(
        'Global "ga" object not available. Please check how to enable it here: https://developers.google.com/analytics/devguides/collection/analyticsjs/'
      );
    }
  }
}

export default function setupGoogleAnalytics(config) {
  if (!config) {
    throw new Error('Please provide a project configuration!');
  }

  const projectConfigs = Array.isArray(config)
    ? config.map((c, key) => {
        setupProject(c);
      })
    : setupProject(config);
}
