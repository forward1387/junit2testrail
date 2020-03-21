'use strict';

const _ = require('underscore');
let Testrail = require('testrail-api'),
    {log} = require('../config/log'),
    {getMilestone} = require('./milestone'),
    {getRun} = require('./run');

exports.getPlans = async (config, milestoneId) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    let filter = {};
    if(milestoneId) filter['milestone_id'] = milestoneId;

    return new Promise((resolve, reject) => {
        testrail.getPlans(config.t.projectId, filter, (err, response, plans) => {
            if(err) reject(err);

            resolve(plans);
        });
    });
};

exports.getPlan = async (config, planName) => {
    return getMilestone(config, config.t.milestone).then((milestone) => exports.getPlans(config, milestone.id)).then((plans) => _.findWhere(plans, {name: planName}));
};

exports.addNewPlan = async (config, milestoneId) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.info(`Create new Plan with name='${config.n}'.`);
    return new Promise((resolve, reject) => {
        testrail.addPlan(config.t.projectId, {name: config.n, milestone_id: milestoneId}, (err, response, plan) => {
            if(err) reject(err);
            
            resolve(plan);
        });
    });
};

exports.addPlan = async (config) => exports.getPlan(config, config.n).then((plan) => {
    if(plan) {
        log.info(`Pan with name='${config.n}' has already created.`);
        return plan;
    }

    return getMilestone(config, config.t.milestone).then((milestone) => exports.addNewPlan(config, milestone.id));
});

exports.addPlanEntries = async (config, entries) => exports.getPlan(config, config.t.plan).then((plan) => {
    if(plan) {
        log.info(`Pan with name='${config.t.plan}' has already created.`);
        return plan;
    }

    return getMilestone(config, config.t.milestone).then((milestone) => exports.addNewPlan(config, milestone.id, entries));
});

exports.addNewPlanEntry = async (config, planId, suiteId, name, caseIds) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.info(`Create a new TestRun='${config.n}' for cases='${JSON.stringify(caseIds)}'.`);
    return new Promise((resolve, reject) => {
        testrail.addPlanEntry(planId, {name: name, case_ids: caseIds, suite_id: suiteId}, (err, response, planEntry) => {
            if(err) reject(err);
            
            resolve(planEntry);
        });
    });
};

exports.addPlanEntry = async (config, cases) => exports.getPlan(config, config.t.plan)
  .then((plan) => getRun(config, config.n).then((run) => {
    log.info(`Run='${JSON.stringify(run)}'`);  

    if(run) {
        log.info(`Run with name='${config.n}' has already created.`);
        return run;
    }

    return exports.addSuite(config, config.t.suite)
        .then((suite) => exports.addNewPlanEntry(config, plan.id, suite.id, config.n, _.map(cases, (cs) => cs.case_id)))
        .then((entry) => _.findWhere(entry.runs, {name: config.n}));
  })).then((run) => exports.sendResult(config, run.id, cases));