/* globals window, self */

function isStaging() {
  const hostname = window.location.hostname;
  return (
    hostname.indexOf('redsift.io') !== -1 ||
    hostname.indexOf('redsift.tech') !== -1 ||
    hostname.indexOf('localhost') !== -1 ||
    hostname.indexOf('beta.ondmarc.com') !== -1
  );
}

function getDefaultProjectSetup() {
  return {
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
    autoLink = [],
    sendInitialPageView = true,
    autoTrack: {
      cleanUrlTracker = null,
      pageVisibilityTracker = null,
      urlChangeTracker = null,
    } = {},
  } = config;
  let retries = 0;

  if (!uaProjectId) {
    throw new Error('Please provide a "uaProjectId"!');
  }

  const projectName = `${uaProjectId}`;
  const allowLinker = autoLink && autoLink.length ? true : false;

  if (ga) {
    ga('create', uaProjectId, 'auto', {
      name: projectName,
      allowLinker,
    });

    ga('set', 'anonymizeIp', anonymizeIp);

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
      ga(`${projectName}.require`, 'pageview');
    }
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
