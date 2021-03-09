const { Client } = require("jira.js");
const dateFns = require('date-fns')

let lastJql;
let events;

export async function get(req, res, next) {
    const { jql, analyzeBeginDate } = req.query;

    if (jql != lastJql) {
        lastJql = jql;
        const issues = await getIssues(decodeURIComponent(jql));
        events = getEvents(issues);
    }

    let filteredEvents;

    if (analyzeBeginDate != 'undefined') {
        filteredEvents = events.filter(e => dateFns.isAfter(e.date, dateFns.parseISO(analyzeBeginDate)))
    } else {
        filteredEvents = events
    }

    const simulations = getSimulations(filteredEvents);
    const datasets = getDatasets(events, simulations)

    const data = {};
    data.datasets = datasets;

    if (data !== null) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    } else {
        next();
    }
}

async function getIssues(jql) {
    const client = new Client({
        host: "https://talentsoft.atlassian.net",
        authentication: {
            basic: {
                username: "cfolliet@talentsoft.com",
                apiToken: "xxx"
            }
        }
    });

    const fields = ['resolutiondate', 'created'];
    let result;

    result = await client.issueSearch.searchForIssuesUsingJqlGet({ jql: jql, fields: fields, maxResults: 100, startAt: 0 });
    let issues = result.issues;

    while (issues.length < result.total) {
        result = await client.issueSearch.searchForIssuesUsingJqlGet({ jql: jql, fields: fields, maxResults: 100, startAt: issues.length });
        issues = [...issues, ...result.issues];
    }

    return issues;
}

function getEvents(issues) {
    const events = [];
    const tmpEvents = [];

    issues.forEach(issue => {
        const createdDate = dateFns.parseJSON(issue.fields.created)
        const createdDay = dateFns.startOfWeek(createdDate, { weekStartsOn: 1 })
        tmpEvents.push({ type: 'new', date: createdDay })

        if (issue.fields.resolutiondate) {
            const doneDate = dateFns.parseJSON(issue.fields.resolutiondate)
            const doneDay = dateFns.startOfWeek(doneDate, { weekStartsOn: 1 })
            tmpEvents.push({ type: 'done', date: doneDay })
        }
    })

    tmpEvents.sort((a, b) => a.date - b.date);

    events.push({ date: new Date(0), new: 0, done: 0, todo: 0 })
    tmpEvents.forEach(tmp => {
        let event;
        const lastEvent = events[events.length - 1];
        if (dateFns.isEqual(lastEvent.date, tmp.date)) {
            event = lastEvent;
        } else {
            event = { date: tmp.date, new: 0, done: 0, todo: lastEvent.todo }
            events.push(event);
        }

        if (tmp.type == 'new') {
            event.new++;
            event.todo++;
        } else if (tmp.type == 'done') {
            event.done++;
            event.todo--;
        }
    })
    events.shift();

    return events
}

function getSimulations(events) {
    if (events.every(e => e.type == 'done')) {
        return null;
    }

    const doneByWeek = getDoneByWeek(events)
    const nbTodos = events[events.length - 1].todo;

    const simulated = []

    const nbSimulation = 1000000;
    let remainingSimulation = nbSimulation
    while (remainingSimulation--) {
        const nbWeeks = simulate(nbTodos, doneByWeek);
        const previous = simulated[nbWeeks];
        if (previous) {
            simulated[nbWeeks]++;
        } else {
            simulated[nbWeeks] = 1;
        }
    }

    const currentWeekDate = dateFns.startOfWeek(new Date(), { weekStartsOn: 1 })
    let lastConfidence = 0
    return simulated.filter(s => s).map((sim, index) => {
        const date = dateFns.addWeeks(currentWeekDate, index)
        const percentage = sim * 100 / nbSimulation
        lastConfidence = lastConfidence + percentage
        return { date, percentage, confidence: lastConfidence }
    });
}

function getDoneByWeek(events) {
    let doneByWeek = {};

    const firstEvent = events[0];
    const firstWeekDate = dateFns.startOfWeek(firstEvent.date, { weekStartsOn: 1 });
    const lastWeekDate = dateFns.startOfWeek(new Date(), { weekStartsOn: 1 });

    dateFns.eachWeekOfInterval({
        start: firstWeekDate,
        end: lastWeekDate
    }, { weekStartsOn: 1 }).forEach(week => doneByWeek[week] = 0)

    events.forEach(event => {
        if (event.done > 0) {
            const week = dateFns.startOfWeek(event.date, { weekStartsOn: 1 });
            doneByWeek[week] += event.done;
        }
    })

    return Object.values(doneByWeek)
}

function simulate(nbTodos, doneByWeek) {
    let currentUnresolved = nbTodos;
    let nbWeeks = 0;
    while (currentUnresolved > 0) {
        nbWeeks++;
        const index = Math.floor(Math.random() * Math.floor(doneByWeek.length))
        currentUnresolved -= doneByWeek[index];
    }
    return nbWeeks
}

function getDatasets(events, simulations) {
    const datasets = { new: [], done: [], todo: [] };

    events.forEach(event => {
        datasets.new.push({ x: event.date, y: event.new })
        datasets.done.push({ x: event.date, y: event.done })
        datasets.todo.push({ x: event.date, y: event.todo })
    })

    const lastEvent = events[events.length - 1]
    const twenty = simulations.find(simulation => simulation.confidence >= 20);
    datasets.twenty = [
        { x: lastEvent.date, y: lastEvent.todo },
        { x: twenty.date, y: 0 }]

    const fifty = simulations.find(simulation => simulation.confidence >= 50);
    datasets.fifty = [
        { x: lastEvent.date, y: lastEvent.todo },
        { x: fifty.date, y: 0 }]

    const heighty = simulations.find(simulation => simulation.confidence >= 80);
    datasets.heighty = [
        { x: lastEvent.date, y: lastEvent.todo },
        { x: heighty.date, y: 0 }]

    return datasets;
}