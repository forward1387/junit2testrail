'use strict';

const Parser = require("junitxml-to-javascript");
new Parser()
    .parseXMLFile("./SERENITY-JUNIT.xml")
    .then(report => console.log(JSON.stringify(report, null, 2)))
    .catch(err => console.error(e.message))