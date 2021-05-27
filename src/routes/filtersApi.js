const { Client } = require("jira.js");

export async function get(req, res, next) {
    const { host, email, token } = req.query;

    const client = getJiraClient(host, email, token)
    const filters = await getFilters(client);

    if (filters !== null) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(filters));
    } else {
        next();
    }
}

async function getFilters(client) {
    let result = await client.filters.searchForFilters({ filterName: 'guesstimate', expand: 'jql' })
    return result.values;
}

function getJiraClient(host, email, token) {
    return new Client({
        host: host,
        authentication: {
            basic: {
                username: email,
                apiToken: token
            }
        }
    });
}