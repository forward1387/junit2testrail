#!/usr/bin/env node
let {log} = require('./config/log'),
    {addMilestone, startMilestone} = require('./testrail/milestones');

require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('milestones', 'Create a milestones into TestRail', (yargs) => {
        return yargs.option('m', {
          alias: 'milestoneName',
          describe: 'TestRail milestones name'
        }).option('s', {
            alias: 'startDate',
            describe: 'TestRail milestones start date'
        }).option('e', {
            alias: 'endDate',
            describe: 'TestRail milestones end date'
        }).option('t', {
            alias: 'testRailConfig',
            describe: 'TestRail config -t.host=<host> -t.username=<username> -t.token=<token|password> -t.projectId=<projectId>'
        });
      },
      (argv) => addMilestone(argv).then((milestone) => {
          log.info('Milestone was successfully created: ' + JSON.stringify(milestone));
          return startMilestone(argv, milestone);
    })).example('milestones', 'junit2testrail milestones -m TestMilestone -s YYYY-MM-DD -e YYYY-MM-DD -t.host=https://<domain>.testrail.net/ -t.username=demo -t.token=demo -t.projectId 1')
    .command('xmlreport', 'Sends junit xml results into TestRail', (yargs) => {
        return yargs.option('f', {
          alias: 'filePath',
          describe: 'path to junit xml report'
        }).option('e', {
            alias: 'endDate',
            describe: 'TestRail milestones end date'
        }).option('t', {
            alias: 'testRailConfig',
            describe: 'TestRail config -t.host=<host> -t.username=<username> -t.token=<token|password> -t.runId=<runId>'
        });
      },
      (argv) => addMilestone(argv).then((milestone) => {
          log.info('Milestone was successfully created: ' + JSON.stringify(milestone));
          return startMilestone(argv, milestone);
    })).example('milestones', 'junit2testrail milestones -m TestMilestone -s YYYY-MM-DD -e YYYY-MM-DD -t.host=https://<domain>.testrail.net/ -t.username=demo -t.token=demo -t.projectId 1')
    .string(['m', 's', 'e'])
    .demandCommand(1)
    .version('v')
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;