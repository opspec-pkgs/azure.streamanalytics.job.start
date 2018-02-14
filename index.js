const msRestAzure = require('ms-rest-azure');
const StreamAnalyticsClient = require('azure-arm-streamanalytics');
const { URL } = require('url');

const login = async () => {
    console.log('logging in');

    const loginType = process.env.loginType;
    const loginId = process.env.loginId;
    const loginSecret = process.env.loginSecret;

    let response;
    if (loginType === 'sp') {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/lib/login.js#L414
        response = await msRestAzure.loginWithServicePrincipalSecret(loginId, loginSecret, process.env.loginTenantId);
    } else {
        // https://github.com/Azure/azure-sdk-for-node/blob/66a255dd882762e93e5b9b92ba63ebb222962d59/runtime/ms-rest-azure/index.d.ts#L376
        response = await msRestAzure.loginWithUsernamePassword(loginId, loginSecret, {domain: process.env.loginTenantId});
    }

    console.log('login successful');
    return response;
};

const startJob = async (credentials) => {
    console.log('starting stream analytics job:', process.env.name);

    // setup options 
    let options = {};
    options.startJobParameters = {};
    options.startJobParameters.outputStartMode = process.env.startMode;
    if (process.env.startTime === " ") {
        options.startJobParameters.outputStartTime = null;
    } else {
        options.startJobParameters.outputStartTime = process.env.startTime;
    }

    let client = new StreamAnalyticsClient(credentials, process.env.subscriptionId);
    let result = await client.streamingJobs.start(process.env.resourceGroup, process.env.name, options);

    if (result === null) {
        console.log('starting stream analytics job successful!');
    }
};

login().then(startJob).catch(error => {
    console.log(error.body.message);
    process.exit(1);
});
