#!/usr/bin/env node
let _ = require('underscore'),
    {addMilestone} = require('./testrail/milestone'),
    {addPlan} = require('./testrail/plan'),
    {addRun} = require('./testrail/run'),
    {parseXMLFiles} = require('./testrail/xmlparser'),
    {sendResult} = require('./testrail/test');

require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('milestone', 'Create a milestone if not exist in TestRail', (yargs) => {
        return yargs.option('n', {
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
      (argv) => addMilestone(argv))
    .example('milestone', 'junit2testrail milestone -n TestMilestone -s YYYY-MM-DD -e YYYY-MM-DD -t.host=https://<domain>.testrail.net/ -t.username=demo -t.token=demo -t.projectId 1')
    .command('plan', 'Create a pan if not exist in TestRail', (yargs) => {
      return yargs.option('n', {
          alias: 'planName',
          describe: 'TestRail plan name'
      }).option('t', {
          alias: 'testRailConfig',
          describe: 'TestRail config -t.host=<host> -t.username=<username> -t.token=<token|password> -t.projectId=<projectId> -t.milestone MilestoneName'
      });
    }, (argv) => addPlan(argv))
    .example('plan', 'junit2testrail plan -n TestPlan -t.host=https://<domain>.testrail.net/ -t.username=demo -t.token=demo -t.projectId 1 -t.milestone MilestoneName')
    .command('xmlreport', 'Sends junit xml results into TestRail', (yargs) => {
        return yargs.option('f', {
          alias: 'filePath',
          describe: 'path to junit xml report'
        }).option('n', {
            alias: 'runName',
            describe: 'TestRail run name'
        }).option('r', {
          alias: 'fileRegexp',
          describe: 'Regexp of file name'
        }).option('t', {
            alias: 'testRailConfig',
            describe: 'TestRail config -t.host=<host> -t.username=<username> -t.token=<token|password> -t.projectId 1 -t.milestone MilestoneName -t.plan PlanName -t.suite SuiteName'
        });
      },
      (argv) => parseXMLFiles(argv).then((cases) => addRun(argv, cases).then((run) => sendResult(argv, run.id, cases))))
      .example('xmlreport', 'junit2testrail xmlreport -f <Ful-path to junit report> -n <Test Run Name> -t.host=https://<domain>.testrail.net/ -t.username=demo -t.token=demo -t.projectId 1 -t.milestone MilestoneName -t.plan PlanName')
    .string(['m', 's', 'e'])
    .demandCommand(1)
    .version('v')
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;