'use strict';

const Parser = require("junitxml-to-javascript"),
  _ = require('underscore');

exports.parseXml = (path) => new Parser().parseXMLFile(path);

exports.mapToTestRailFormat = (report) => {
    let testCases = [];
    for (let suite of report.testsuites) {
        _.forEach(suite.testCases, (tc) => {
            let trTest = {
                test_id: undefined,
                status_id: undefined,
            };
            let match = /#(.*)/.exec(trTest.name);
            if(match !== null) {
                test_id = match[1];
                if (tc.result === 'succeeded') trTest.status_id = 1;
                if (tc.result === 'failed') {
                    trTest.status_id = 5;
                    trTest[comment] = trTest.message;
                }

                testCases.push(trTest);
            }

        });
    }
};