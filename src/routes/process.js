const { Client } = require("jira.js");
const dateFns = require('date-fns')

const EPIC_FIELD = 'customfield_10008';

// Initialize
const client = new Client({
    host: "https://talentsoft.atlassian.net",
    authentication: {
        basic: {
            username: "cfolliet@talentsoft.com",
            apiToken: "oXejQc9xTvONvCLBBZQcE791"
        }
    }
});

const nbMonths = 3;

function getWeekDates() {
    const begin = dateFns.subMonths(new Date(), nbMonths)
    const beginWeek = dateFns.startOfWeek(begin, { weekStartsOn: 1 })
    const endWeek = dateFns.startOfWeek(new Date());

    const weeks = dateFns.eachWeekOfInterval({
        start: beginWeek,
        end: endWeek
    }, { weekStartsOn: 1 })

    return weeks;
}

async function getEpic(key) {
    const fields = ['summary'];
    const result = await client.issues.getIssue({ issueIdOrKey: key, fields: fields });
    return result
}

async function getIssues(startAt = 0) {
    const jqlNF = "\"Product Line\" in (\"Perf & Comp\", \"Talent Review\", \"Talent Management > Career\") AND project = CAR AND issuetype != epic AND (resolved > \"-" + (nbMonths * 30) + "d\" OR resolved = null)"
    const jqlCC = "\"Product Line\" = \"Talent Management > Continuous Conversation\" AND (type != \"Technical Debt\" OR priority = High OR priority = Maximum) AND project = \"Continuous Conversation\" AND issuetype != epic AND (resolved > \"-" + (nbMonths * 30) + "d\" OR resolved = null)"
    const fields = [EPIC_FIELD, 'resolutiondate'];
    const result = await client.issueSearch.searchForIssuesUsingJqlGet({ jql: jqlNF, fields: fields, maxResults: 100, startAt: startAt });
    let issues = result.issues;
    //console.log("result.maxResults", result.maxResults, "result.total", result.total);

    if (startAt + result.issues.length < result.total) {
        issues = [...issues, ...await getIssues(startAt + result.maxResults)];
    }

    //console.log("length ", issues.length)

    return issues;
}

function simulate(data, orderedWeeks) {
    let unresolved = data.unresolved.length;
    let nbWeeks = 0;
    while (unresolved > 0) {
        nbWeeks++;
        const index = Math.floor(Math.random() * Math.floor(orderedWeeks.length))
        unresolved -= orderedWeeks[index];
    }
    return nbWeeks
}

function displayEstimated(simulated) {
    const data = [];
    const total = simulated.reduce((acc, value) => acc + value);

    const firstWeek = dateFns.startOfWeek(new Date(), { weekStartsOn: 1 });

    simulated.forEach((x, i) => {
        const percentage = x * 100 / total;

        data.push({
            x: dateFns.addWeeks(firstWeek, i),
            y: percentage
        })
    })

    return data;
}

function getData(issues) {
    const weeks = getWeekDates();
    const data = { unresolved: [], weeks: {} };
    weeks.forEach(w => data.weeks[w] = []);

    issues.forEach(issue => {
        if (issue.fields.resolutiondate) {
            const isoDate = dateFns.parseISO(issue.fields.resolutiondate)
            const endWeek = dateFns.startOfWeek(new Date());
            if (dateFns.compareAsc(isoDate, endWeek) < 0) {
                const week = dateFns.startOfWeek(isoDate, { weekStartsOn: 1 });
                data.weeks[week].push(issue)
            }
        } else {
            data.unresolved.push(issue);
        }
    });
    return data;
}

function getEstimated(data) {
    const orderedWeeks = Object.values(data.weeks).map(w => w.length).sort((a, b) => a - b);
    const theoricalMin = data.unresolved.length / orderedWeeks[orderedWeeks.length - 1];
    const theoricalMax = data.unresolved.length / orderedWeeks[0];

    if (theoricalMin == Infinity) {
        return null;
    }

    //console.log('unresolved', data.unresolved.length);
    //console.log('theorical min', theoricalMin)
    //console.log('theorical max', theoricalMax)
    const simulated = []

    let nbSimulation = 1000000;
    while (nbSimulation--) {
        const nbWeeks = simulate(data, orderedWeeks);
        const previous = simulated[nbWeeks];
        if (previous) {
            simulated[nbWeeks]++;
        } else {
            simulated[nbWeeks] = 1;
        }
    }

    return simulated;
}

function getIssuesByEpic(issues) {
    const byEpic = {};
    issues.forEach(issue => {
        const epicKey = issue.fields[EPIC_FIELD];
        const epic = byEpic[epicKey];
        if (epic) {
            epic.push(issue);
        } else {
            byEpic[epicKey] = [issue];
        }
    })
    //console.log(Object.entries(byEpic).map(e => e[0] + ': ' + e[1].length))
    return byEpic;
}

async function getAllEpics(keys) {
    const epics = {};
    for (const key of keys) {
        epics[key] = await getEpic(key);
    }

    return epics
}

async function main() {
    const result = [];
    const issues = await getIssues();

    const epicKeys = new Set(issues.filter(issue => issue.fields[EPIC_FIELD]).map(issue => issue.fields[EPIC_FIELD]));
    const epics = await getAllEpics(epicKeys);

    //const data = getData(issues);
    //const estimated = getEstimated(data);
    //displayEstimated(estimated)

    const issuesByEpic = getIssuesByEpic(issues);

    Object.entries(issuesByEpic).forEach(([key, issues]) => {
        let epic = epics[key];
        let estimate = null;
        const data = getData(issues);
        const estimated = getEstimated(data);
        if (estimated) {
            estimate = displayEstimated(estimated)
        } else {
            estimate = Infinity
        }

        const summary = epic ? epic.fields.summary : null;

        result.push({ epic: key, summary: summary, unresolved: data.unresolved.length, past: data.weeks, future: estimate })
    })

    return result;
}

//main();

export async function get(req, res, next) {
    // the `slug` parameter is available because this file
    // is called [slug].json.js
    const { slug } = req.params;

    const data = await main();

    if (data !== null) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    } else {
        next();
    }
}