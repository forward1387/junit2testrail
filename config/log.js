'use strict';

const log4js = require('log4js');
let logger;

let getLogger = () => {
	if(logger) return logger;

	logger = log4js.getLogger();
	logger.level = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
	logger.debug(`LOG Level: ${logger.level}`);

	return logger;
};

exports.log = getLogger();