// config.js - DO NOT commit this file to version control
const SMS_CONFIG = {
    // Use sandbox for testing (free, doesn't deliver real SMS)
    sandboxMode: true,

    // Your API key - replace with your actual key
    apiKey: 'my api goes here',

    // Your approved sender ID
    senderId: 'LimolMicro',

    // API endpoints
    sandboxUrl: 'https://sms.sasusync.com/smssandbox/v1/send',
    liveUrl: 'https://sms.sasusync.com/api/v1/send',

    get endpoint() {
        return this.sandboxMode ? this.sandboxUrl : this.liveUrl;
    }
};
