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

exports.getMilestone = async (config) => {
    let milestones = await exports.getMilestones(config);

    return _.findWhere(milestones, {name: config.m});
};

exports.addMilestone = async (config) => {
    let milestone = await exports.getMilestone(config);
    if(milestone) {
        log.info(`Milestone with name='${config.m}', startDate='${config.s}' and endDate='${config.e}' has already created.`);
        return milestone;
    }

    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    log.info(`Create milestone with name='${config.m}', startDate='${config.s}' and endDate='${config.e}'.`);
    return new Promise((resolve, reject) => {
        testrail.addMilestone(config.t.projectId, {name: config.m, due_on : moment(config.e, 'YYYY-MM-DD').unix(), start_on : moment(config.s, 'YYYY-MM-DD').unix()}, (err, response, milestone) => {
            if(err) reject(err);

            resolve(milestone)
        });
    });
};

exports.startMilestone = async (config, milestone) => {
    let testrail = new Testrail({
        host: config.t.host,
        user: config.t.username,
        password: config.t.token
    });

    return new Promise((resolve, reject) => {
        testrail.updateMilestone(milestone.id, {is_started: true}, (err, response, milestone) => {
            if(err) reject(err);

            log.info(`Start milestone: ${JSON.stringify(milestone)}`);
            resolve(milestone)
        });
    });
};