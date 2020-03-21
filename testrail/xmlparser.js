'use strict';

const Parser = require("junitxml-to-javascript"),
  Testrail = require('testrail-api'),
  {log} = require('../config/log'),
  _ = require('underscore');

exports.parseXml = (config) => new Parser().parseXMLFile(config.f).then((results) => exports.mapToTestRailFormat(config, results));

exports.mapToTestRailFormat = (config, report) => {
    let testCases = [];
    for (let suite of report.testsuites) {
        _.forEach(suite.testCases, (tc) => {
            let trTest = {
                case_id: undefined,
                status_id: undefined,
            };
            log.debug(JSON.stringify(tc));
            let match = /@(.*)/.exec(tc.name);
            if(match !== null) {
                trTest['case_id'] = Number(match[1]);
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