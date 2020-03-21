'use strict';

const _ = require('underscore');
let Testrail = require('testrail-api'),
    {log} = require('../config/log');

exports.addNewSuite = async (config, name) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    return new Promise((resolve, reject) => {
        testrail.addSuite(config.t.projectId, {name: name},(err, response, suite) => {
            if(err) reject(err);
            resolve(suite);
        });
    });
};

exports.getSuites = async (config) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    return new Promise((resolve, reject) => {
        testrail.getSuites(config.t.projectId, (err, response, suites) => {
            if(err) reject(err);
            resolve(suites);
        });
    });
};

exports.getSuite = async (config, name) => {
    return exports.getSuites(config).then((suites) => {
        log.info(`Suites: ${JSON.stringify(suites)}`);
        return _.findWhere(suites, {name: name});
    });
};

exports.addSuite = async (config, name) => exports.getSuite(config, name).then((suite) => {
    if(suite) return suite;

    return exports.addNewSuite(config, name);
});