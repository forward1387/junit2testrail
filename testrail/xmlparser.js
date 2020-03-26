'use strict';

const Parser = require("junitxml-to-javascript"),
  {log} = require('../config/log'),
  fs = require('fs'),
  _ = require('underscore'),
  dir = require('node-dir');

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

exports.readFiles = (config, files) => {
    return Promise.all(_.map(files, (fl) => new Parser().parseXMLFile(fl).then((results) => exports.mapToTestRailFormat(config, results))));
} 

exports.parseXMLFiles =  async (config) => {
    if(fs.lstatSync(config.f).isDirectory()) {
        return exports.readFiles(config, _.filter(dir.files(config.f, {sync:true}), (filePath) => filePath.match(new RegExp(config.r)) !== null)).then((res) => _.flatten(res));
    } else {
        return exports.parseXml(config);
    }
};
