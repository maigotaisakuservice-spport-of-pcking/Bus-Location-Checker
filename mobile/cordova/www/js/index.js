let app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
        this.setupBackgroundMode();
    },

    setupBackgroundMode: function() {
        if (window.cordova && cordova.plugins && cordova.plugins.backgroundMode) {
            // Enable background mode
            cordova.plugins.backgroundMode.enable();

            // Set notification to show the app is running
            cordova.plugins.backgroundMode.setDefaults({
                title: 'バス位置送信中',
                text: 'アプリはバックグラウンドで動作しています',
                icon: 'icon', // assumes icon.png in platforms/android/res/drawable/
                color: 'F14336',
                resume: true,
                hidden: false,
                bigtext: true
            });

            // Prevent UI freezing
            cordova.plugins.backgroundMode.on('activate', function() {
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
            });

            // Handle background mode lifecycle
            cordova.plugins.backgroundMode.on('deactivate', function() {
                console.log('App returned to foreground');
            });
        }
    }
};

app.initialize();
