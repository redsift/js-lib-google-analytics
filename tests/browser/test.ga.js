const { default: setupGoogleAnalytics, getDefaultProjectSetup } = JsLibGoogleAnalytics;

describe('api', function() {
    describe('GET /api/users', function() {
      it('respond with an array of users', function() {
        const config = {
            uaProjectId: 'UA-55652568-2',
            ...getDefaultProjectSetup(),
        };
        
        console.log('config:', config);

        setupGoogleAnalytics(config);

        expect(2).toBe(2);
      });
    });
  });
  