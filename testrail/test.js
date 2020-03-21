'use strict';

const _ = require('underscore');
let Testrail = require('testrail-api'),
    {log} = require('../config/log');

exports.getTests = async (config, runId) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    return new Promise((resolve, reject) => {
        testrail.getTests(runId, (err, response, tests) => {
            if(err) reject(err);

            resolve(tests);
        });
    });
};

exports.addResultsForCases = async (config, runId, cases) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.info(`Send results for runId: '${JSON.stringify(runId)}': ${JSON.stringify(cases)}`);
    return new Promise((resolve, reject) => {
        if(_.size(cases) === 0) resolve(cases);
        
        testrail.addResultsForCases(runId, cases, (err, response, result) => {
            if(err) reject(err);
            resolve(result);
        });
    });
};

exports.sendResult = async (config, runId, cases) => exports.getTests(config, runId).then((tss) => {
    let casesId = _.map(tss, (cs) => cs.case_id);
    log.info(`Cases Ids: ${JSON.stringify(casesId)}`);
    log.info(`Results: ${JSON.stringify(cases)}`);
    return exports.addResultsForCases(config, runId, _.filter(cases, (cs) => _.contains(casesId, cs.case_id)));
});
