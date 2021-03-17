const { Client } = require("jira.js");

export async function get(req, res, next) {
    const { email, token } = req.query;

    const client = getJiraClient(email, token)
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

function getJiraClient(email, token) {
    return new Client({
        host: "https://talentsoft.atlassian.net",
        authentication: {
            basic: {
                username: email,
                apiToken: token
            }
        }
    });
}