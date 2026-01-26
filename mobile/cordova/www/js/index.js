let app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    onDeviceReady: function() {
        console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
        this.setupBackgroundMode();
    },

    setupBackgroundMode: function() {
        // Enable background mode
        if (window.cordova && cordova.plugins && cordova.plugins.backgroundMode) {
            cordova.plugins.backgroundMode.enable();
            cordova.plugins.backgroundMode.on('activate', function() {
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
            });
        }
    }
};

app.initialize();
