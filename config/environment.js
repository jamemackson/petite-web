'use strict';

function makeDomain(obj) {
  obj.sources = obj.sources || [];
  obj.protocols = obj.protocols || [];
  obj.subdomains = obj.subdomains || [];
  obj.ports = obj.ports || [];
  return obj;
}
function appendPorts(domains, ports) {
  var a = [];
  domains.forEach(function (d) {
    ports.forEach(function (p) {
      a.push(d + ':' + p);
    });
  });
  return domains.concat(a);
}
function appendSubdomains(subs, domain) {
  var a = [domain];
  if (subs) {
    subs.forEach(function (sub) {
      a.push(sub + '.' + domain);
    });
  }
  return a;
}
function appendProtocols(domains, protocols) {
  var a = [];
  domains.forEach(function (d) {
    protocols.forEach(function (p) {
      a.push(p + '://' + d);
    });
  });
  return a;
}
function makeCSP(CSP, domains) {
  domains.forEach(function (o) {
    var domain = makeDomain(o);
    domain.sources.forEach(function (source) {
      var parts = appendSubdomains(domain.subdomains, domain.domain);
      parts = appendProtocols(parts, domain.protocols);
      parts = appendPorts(parts, domain.ports);
      CSP[source] += ' ' + parts.join(' ');
    });
  });
  return CSP;
}

module.exports = function (environment) {
  let ENV = {
    modulePrefix: 'petitesalon-web',
    podModulePrefix: 'petitesalon-web/routes',
    environment,
    rootURL: '/',
    locationType: 'auto',
    apiHost: process.env.API_HOST || 'http://localhost:4000',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    fastboot: {
      // TODO: change to hostAllowedList when possible. #BLM
      hostWhitelist: [
        /petitesalon.com/,
        /[a-z1-9-]+.petitesalon.com$/,
        /[\S]+.herokuapp\.com$/,
        /^localhost:\d+$/,
        /[a-z1-9-]+.ngrok.io$/
      ]
    },
    metricsAdapters: [
      {
        name: 'GoogleAnalytics',
        environments: ['development', 'production'],
        config: {
          id: 'UA-60845043-2',
          // Use `analytics_debug.js` in development
          debug: environment === 'development',
          // Use verbose tracing of GA events
          trace: environment === 'development',
          // Ensure development env hits aren't sent to GA
          sendHitTask: environment !== 'development',
          // Specify Google Analytics plugins
          require: [
            /*'ecommerce'*/
          ]
        }
      }
    ]
  };

  ENV['ember-meta'] = {
    imgSrc: 'https://res.cloudinary.com/petite/image/upload/f_auto/fl_lossy/q_auto:eco/w_350/petite-salon-logo',
    siteName: 'Petite Salon',
    title: 'Petite Salon',
    description: 'Petite Salon has locations in Saint Paul and Minneapolis.',
    // twitterUsername: '@petitesalon',
    url: 'https://petitesalon.com/'
  };

  ENV['ember-simple-auth-token'] = {
    refreshAccessTokens: true, // Enables access token refreshing
    refreshLeeway: 30, // refresh 30 seconds (.5 minutes) before expiration
    serverTokenEndpoint: `${ENV.apiHost}/admin/auth/login/`, // Server endpoint to send authenticate request
    tokenPropertyName: 'token',

    // tokenDataPropertyName: 'tokenData', // Key in session to store token data
    tokenExpirationInvalidateSession: true, // Enables session invalidation on token expiration
    serverTokenRefreshEndpoint: `${ENV.apiHost}/admin/auth/refresh/`, // Server endpoint to send refresh request
    refreshTokenPropertyName: 'refresh', // Key in server response that contains the refresh token
    tokenExpireName: 'exp', // Field containing token expiration

    authorizationHeaderName: 'token', // Header name added to each API request
    authorizationPrefix: '' // Prefix added to each API request
  };

  const DOMAINS = [
    // {
    //   sources: ['script-src', 'connect-src', 'img-src', 'style-src', 'font-src'],
    //   protocols: ['http', 'https'],
    //   domain: process.env.ASSET_HOST
    // },
    {
      sources: ['script-src', 'connect-src', 'img-src', 'style-src', 'font-src', 'frame-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: '*.petitesalon.com'
      // ports: [4200,4201,1776,4000,3000]
    },
    {
      sources: ['script-src', 'connect-src', 'img-src', 'style-src', 'font-src', 'frame-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: '*.ngrok.io'
      // ports: [4200,4201,1776,4000,3000]
    },
    {
      sources: ['script-src', 'connect-src', 'img-src', 'style-src', 'font-src', 'frame-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: '*.herokuapp.com'
      // ports: [4200,4201,1776,4000,3000]
    },
    {
      sources: ['connect-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: 'localhost',
      ports: [4200, 4201, 1776, 4000, 3000]
    },
    {
      sources: ['img-src'],
      protocols: ['http', 'https'],
      domain: '*.amazonaws.com'
    },
    {
      sources: ['font-src', 'script-src', 'style-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: '*.fontawesome.com'
    },
    {
      sources: ['font-src', 'script-src', 'style-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: '*.cloudflare.com'
    },
    {
      sources: ['font-src', 'script-src', 'style-src'],
      protocols: ['http', 'https', 'ws', 'wss'],
      domain: '*.googleapis.com'
    },
    {
      sources: ['connect-src', 'script-src'],
      protocols: ['https'],
      domain: 'www.google-analytics.com'
    }
  ];

  // ENV.contentSecurityPolicy = makeCSP(
  //   {
  //     'default-src': "'none'",
  //     'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
  //     'font-src': "'self' data: https://fonts.gstatic.com data:",
  //     'connect-src': "'self'",
  //     'img-src': "'self' data:",
  //     'report-uri': "'localhost'",
  //     'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
  //     'media-src': "'self'",
  //     'frame-src': ''
  //   },
  //   DOMAINS
  // );

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
