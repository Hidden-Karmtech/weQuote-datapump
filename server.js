#!/bin/env node

var config = require("./config");
var googleApi = require("./google-api");
var wequoteApi = require("./wequote-api");
var schedule = require('node-schedule');
var _ = require('underscore');

var weQuoteInsert = function(rows){
	var insert;
	var i,params,row;
	var weQuoteInsertRow = function(row){
		insert = function (result) {
			if(result === false){
				var tagsString = row.tag.split(",");
				var tags = _.map(tagsString,function(tag){
					return {
						name : tag
					};
				});
				var quote = {
					text  	: row.quote,
					author	: row.author,
					source	: row.url,
					tags	: tags
				};
				console.log(quote);
				wequoteApi.insert(quote).then(
					function(){
						console.log("insert: tag:" + row.tags + " quote:" + row.quote);
					}
				).fail(
					function(error){
						console.log("errore: " + error);
					}
				);
			}
		};
		params = {
			search : row.quote
		};
		wequoteApi.list(params).then(insert);
	};
	_.each(rows,weQuoteInsertRow);
	
};

googleApi.getDataTable(config.outputId).then(weQuoteInsert);
/*
var rule = new schedule.RecurrenceRule();
rule.hour = 19;

var j = schedule.scheduleJob(rule, function(){
    console.log('Schedulazione sheet2mongo.');
});
*/
/*
var params = {
	search : "lasciare"
};
var testThen = function (result) {
	console.log(result);
};

wequoteApi.list(params).then(testThen);*/