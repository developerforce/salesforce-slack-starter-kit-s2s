const { App, LogLevel } = require('@slack/bolt');
const config = require('./config/config');
const { registerListeners } = require('./listeners');
const { jwtAuthWithSalesforce } = require('./middleware/salesforce-auth');

let logLevel;
switch (process.env.LOG_LEVEL) {
    case 'debug':
        logLevel = LogLevel.DEBUG;
        break;
    case 'info':
        logLevel = LogLevel.INFO;
        break;
    case 'warn':
        logLevel = LogLevel.WARN;
        break;
    case 'error':
        logLevel = LogLevel.ERROR;
        break;
    default:
        logLevel = LogLevel.INFO;
}

// Initializes your app with your bot token and signing secret
const app = new App({
    ...config.slack,
    logLevel
});

registerListeners(app);

// Call global middleware to fetch Salesforce Authentication details
app.use(jwtAuthWithSalesforce);

(async () => {
    try {
        // Start your app
        await app.start(process.env.PORT || 3000);
        console.log('⚡️ Bolt app is running!');
    } catch (error) {
        console.error('Unable to start App', error);
        process.exit(1);
    }
})();
