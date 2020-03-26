'use strict';

const _ = require('underscore');
let Testrail = require('testrail-api'),
    {log} = require('../config/log'),
    {getMilestone} = require('./milestone'),
    {getSuite} = require('./suite');

exports.getRuns = async (config, milestoneId) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    let filter = {};
    if(milestoneId) filter['milestone_id'] = milestoneId;

    return new Promise((resolve, reject) => {
        testrail.getRuns(config.t.projectId, filter, (err, response, plans) => {
            if(err) reject(err);

            resolve(plans)
        });
    });
};

exports.getRun = async (config, name) => getMilestone(config, config.t.milestone)
    .then((milestone) => exports.getRuns(config, milestone.id)
    .then((runs) => {
        log.info(`List Test Runs: ${JSON.stringify(runs)}`);
        return _.findWhere(runs, {name: name});
    }));

exports.addNewRun = async (config, name, suiteId, milestoneId, caseIds) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    return new Promise((resolve, reject) => {
        testrail.addRun(config.t.projectId, {suite_id: suiteId, name: name, milestone_id: milestoneId, case_ids: caseIds, include_all: false}, (err, response, run) => {
            if(err) reject(err);

            resolve(run)
        });
    });
};

exports.addRun = async (config, cases) => exports.getRun(config, config.n).then((run) => {
    if(run) return run;

    log.info(`Cases: ${JSON.stringify(cases)}`);

    return getMilestone(config, config.t.milestone)
        .then((milestone) => getSuite(config, config.t.suite)
            .then((suite) => exports.addNewRun(config, config.n, suite.id, milestone.id, _.map(cases, (cs) => cs.case_id))));
});