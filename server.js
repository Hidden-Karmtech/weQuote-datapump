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
			if(result === -1){
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
			else
			{
				var id = result;
				wequoteApi.update(id,quote).then(
					function(){
						console.log("update: tag:" + row.tags + " quote:" + row.quote);
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



var rule = new schedule.RecurrenceRule();
rule.second = 1;

var j = schedule.scheduleJob(rule, function(){
	googleApi.getDataTable(config.outputId).then(weQuoteInsert);
    console.log('Schedulazione sheet2mongo.');
});

console.log('Avvio sheet2mongo.');

/*
var params = {
	search : "lasciare"
};
var testThen = function (result) {
	console.log(result);
};

wequoteApi.list(params).then(testThen);*/