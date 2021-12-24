'use strict';

const Salesforce = require('../salesforcelib/connect');
const config = require('../config/config');
const NodeCache = require('node-cache');
const sf = new Salesforce(config.salesforce);
// Cache to Store jsforce connection
const connectionCache = new NodeCache({ stdTTL: 600 });

const jwtAuthWithSalesforce = async ({ payload, context, next }) => {
    let slackUserId;
    let sfConnection = {};
    // For all events Slack returns the users Id as user.id
    if (payload.user.id) {
        slackUserId = payload.user.id;
    } else {
        // For Home Event a Special Case
        slackUserId = payload.user;
    }
    // Cache connection object for 10 minutes in the app
    if (connectionCache.has(slackUserId)) {
        sfConnection = connectionCache.get(slackUserId);
        context.hasAuthorized = true;
    } else {
        try {
            sfConnection = await sf.connect();
            context.sfconnection = sfConnection;
            context.hasAuthorized = true;
            connectionCache.set(slackUserId, sfConnection);
        } catch (e) {
            console.log(e);
            throw new Error(e.message);
        }
    }
    await next();
};

module.exports = { jwtAuthWithSalesforce };
