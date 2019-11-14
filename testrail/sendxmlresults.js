'use strict';

const Parser = require("junitxml-to-javascript"),
  Testrail = require('testrail-api'),
  {log} = require('../config/log'),
  _ = require('underscore');

exports.parseXml = (path) => new Parser().parseXMLFile(path);

exports.mapToTestRailFormat = (config, report) => {
    let testCases = [];
    for (let suite of report.testsuites) {
        _.forEach(suite.testCases, (tc) => {
            let trTest = {
                test_id: undefined,
                status_id: undefined,
            };
            log.debug(JSON.stringify(tc));
            let match = /#(.*)/.exec(tc.name);
            if(match !== null) {
                trTest['test_id'] = match[1];
                if (tc.result === 'succeeded') {
                    trTest['status_id'] = 1;
                } else if (tc.result === 'failed') {
                    trTest['status_id'] = 5;
                    trTest['comment'] = tc.message;
                    if(config.t.assignedToId) {
                        trTest['assignedto_id'] = config.t.assignedToId;
                    }
                } else {
                    trTest['status_id'] = 4
                    trTest['comment'] = tc.message;
                }

                testCases.push(trTest);
            }

        });
    }

    log.debug(JSON.stringify(testCases));
    return testCases;
};

exports.sendResults = (config) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.debug(JSON.stringify(config.t));

    return new Promise((resolve, reject) => exports.parseXml(config.f).then((results) => testrail.addResults(config.t.runId, exports.mapToTestRailFormat(config, results), (err, response, res) => {
        if(err) reject(err);
        resolve(res);
    })));
};