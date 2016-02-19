var CronJob = require('node-schedule');

var config = require('../config');
var parser = require('./parser');

exports.call = function() {
	CronJob.scheduleJob(config.cron.time, function() {
  		parser.feed();
	});
};

exports.recall = function(location, date) {
    var newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + config.cron.daysToAdd);
    CronJob.scheduleJob(newDate, function() {
        parser.html(location, date);
    });

};