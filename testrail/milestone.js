'use strict';

const _ = require('underscore');
let Testrail = require('testrail-api'),
    moment = require('moment'),
    {log} = require('../config/log');

exports.getMilestones = async (config) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    return new Promise((resolve, reject) => {
        testrail.getMilestones(config.t.projectId, (err, response, milestones) => {
            if(err) reject(err);

            resolve(milestones)
        });
    });
};

exports.getMilestone = async (config, milestoneName) => {
    let milestones = await exports.getMilestones(config);

    return _.findWhere(milestones, {name: milestoneName});
};

exports.addNewMilestone = async (config) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.info(`Create new milestone with name='${config.n}', startDate='${config.s}' and endDate='${config.e}'.`);
    return new Promise((resolve, reject) => {
        testrail.addMilestone(config.t.projectId, {name: config.n, due_on: moment(config.e, 'YYYY-MM-DD').valueOf(), start_on: moment(config.s, 'YYYY-MM-DD').valueOf()}, (err, response, milestone) => {
            if(err) reject(err);
            log.info(`Milestone created: ${JSON.stringify(milestone)}`);
            resolve(milestone)
        });
    });
};

exports.addMilestone = async (config) => {
    let milestone = await exports.getMilestone(config);
    if(milestone) {
        log.info(`Milestone with name='${config.n}', startDate='${config.s}' and endDate='${config.e}' has already created.`);
        return milestone;
    }

    return exports.addNewMilestone(config).then((milestone) => exports.startMilestone(config, milestone).then(() => milestone));
};

exports.startMilestone = async (config, milestone) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.info(`Start milestone: ${JSON.stringify(milestone)}`);
    return new Promise((resolve, reject) => {
        testrail.updateMilestone(milestone.id, {is_started: true}, (err, response, milestone) => {
            if(err) reject(err);

            resolve(milestone)
        });
    });
};