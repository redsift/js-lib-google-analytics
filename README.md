# js-lib-google-analytics

`js-lib-google-analytics` is a helper library to setup Google Analytics via [analytics.js](https://developers.google.com/analytics/devguides/collection/analyticsjs/). It provides:

* Setup for sending of events to a single or multiple Google Analytics projects.
* Setup of [cross domain linking](https://support.google.com/analytics/answer/1034342?hl=en).
* Allows to enable [IP anonimization](https://developers.google.com/analytics/devguides/collection/analyticsjs/ip-anonymization).
* Optional configuration for the `autotrack.js` plugins `cleanUrlTracker`, `pageVisibilityTracker` and `urlChangeTracker`.

## Setup

### Prerequisites: analytics.js and (optionally) autotrack.js

[analytics.js](https://developers.google.com/analytics/devguides/collection/analyticsjs/) is Google's official tracking library, providing the global `ga` object which this repository helps to configure. Please use [the installation instructions](https://developers.google.com/analytics/devguides/collection/analyticsjs/) to setup `analytics.js`.

Optionally you can install the [autotrack.js](https://github.com/googleanalytics/autotrack) library, which, according to its Github repository, does *"Automatic and enhanced Google Analytics tracking for common user interactions on the web."*. Check the repository documentation for more information and see the next step on how to configure a selection of `autotrack` plugins via `js-lib-google-analytics`.

### Usage

### Default usage

To use the default configuration which comes with the library use the following code:

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup } from '@redsift/js-lib-google-analytics';

const config = {
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
};

setupGoogleAnalytics(config);
```

Using `getDefaultProjectSetup()` yields this configuration:

```javascript
{
    anonymizeIp: true, // enable IP anonimization
    cookieName: '_ga',
    anonymizeIp: true,
    userId: null, // if set the `userId` will be set for the tracker, see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#userId
    userId: null, // if set the `userId` will be set for the tracker, see https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference?hl=en#clientId
    clientId: null,
    autoLink: [], // don't configure cross domain linking 
    sendInitialPageView: true, // send an initial page view when using `setupGoogleAnalytics()`
    autoTrack: {
      // configure the `cleanUrlTracker` autotrack plugin with this configuration
      // see https://github.com/googleanalytics/autotrack/blob/master/docs/plugins/clean-url-tracker.md        
      cleanUrlTracker: {
        stripQuery: true,
        queryDimensionIndex: 1,
        indexFilename: 'index.html',
        trailingSlash: 'remove',
      },
      // enable the `urlChangeTracker` autotrack plugin
      // see https://github.com/googleanalytics/autotrack/blob/master/docs/plugins/url-change-tracker.md#differentiating-between-virtual-pageviews-and-the-initial-pageview
      urlChangeTracker: true, // configure the `urlChangeTracker` autotrack plugin with this configuration
    },
}
```

You can use this configuration as a base for your own customization.

> NOTE: If you don't provide a `name` property to the config the tracker name will be derived from the `uaProjectId` in removing all `-`.

### Sending events to multiple projects

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup } from '@redsift/js-lib-google-analytics';

const configs = [{
    uaProjectId: 'UA-PROJECT-ID-0',
    ...getDefaultProjectSetup(),
}, {
    uaProjectId: 'UA-PROJECT-ID-1',
    ...getDefaultProjectSetup(),
}];

setupGoogleAnalytics(configs);
```

This will send events to each configured projects. A use case is to have a GA project which only collects events for a single domain, and a second project which collects events from all your domains, including the one you are using `@redsift/js-lib-google-analytics` for (in this case it is useful to setup cross domain linking, see below).

### Cross domain linking

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup } from '@redsift/js-lib-google-analytics';

const config = {
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
    autoLink: ['blog.myproject.at', 'docs.myproject.at'],
};

setupGoogleAnalytics(config);
```

This will provide pageview and URL information for the domains referenced in `autoLink` in the `UA-PROJECT-ID` project.

### Usage without `autotrack.js`

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup } from '@redsift/js-lib-google-analytics';

const config = {
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
    autoTrack: null,
};

setupGoogleAnalytics(config);
```

This will provide setup `analytics.js` but will skip the configuration of `autotrack.js`.

### Trigger events for all configured projects

After you called `setupGoogleAnalytics()` you can send events to all of them with a single command. Please note that this command only supportes 3 parameters max:

```javascript
import setupGoogleAnalytics, { gaAll } from '@redsift/js-lib-google-analytics';

// ... setup you projects

gaAll('send', 'pageview'); // Sends a pageview event to all configured projects.
```

### Configure a session based cookie (which immediately expires)

See https://developers.google.com/analytics/devguides/collection/analyticsjs/cookies-user-id#cookie_expiration for more information.

To create a permanent cookie after initializing the session based on you can call `setupGoogleAnalytics()` without the `temporarySession` config parameter. The `clientId` for the cookie will stay the same in this case, so your GA project will treat the two sessions as the same user.

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup } from '@redsift/js-lib-google-analytics';

const temporarySessionConfig = {
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
    temporarySession: true,
};

setupGoogleAnalytics(temporarySessionConfig);

// To make the cookie permanent call the setup function again without `temporarySession`:

const config = {
    uaProjectId: 'UA-PROJECT-ID',
    ...getDefaultProjectSetup(),
};

setupGoogleAnalytics(config);
```

### Get a list of the configured project names

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup, getProjectNames } from '@redsift/js-lib-google-analytics';

const config = [{
    uaProjectId: 'UA-PROJECT-ID-0',
    ...getDefaultProjectSetup(),
}, {
    uaProjectId: 'UA-PROJECT-ID-1',
    ...getDefaultProjectSetup(),
}];

setupGoogleAnalytics(config);

console.log(getProjectNames()); // Returns a Set of project names, here: ['UA-PROJECT-ID-0' 'UA-PROJECT-ID-1']

console.log(getProjectNames({ asArray: true })); // Returns an Array of project names, here: ['UA-PROJECT-ID-0' 'UA-PROJECT-ID-1']
```

### Set a custom project name for the tracker

```javascript
import setupGoogleAnalytics, { getDefaultProjectSetup, getProjectNames } from '@redsift/js-lib-google-analytics';

const config = {
    uaProjectId: 'UA-PROJECT-ID-0',
    name: 'MyTracker',
    ...getDefaultProjectSetup(),
};

setupGoogleAnalytics(config);

console.log(getProjectNames()); // ['MyTracker']
```