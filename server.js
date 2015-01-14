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
			if(result === -1){
				wequoteApi.insert(quote).then(
					function(){
						//console.log("insert: tag:" + row.tag + " quote:" + row.quote);
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
						//console.log("update: tag:" + row.tag + " quote:" + row.quote);
						row.id=id;
						row.save();
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

var getSheets = function(sheets)
{
	console.log("File count: "+sheets.length);
	var promiseArray=[];
	sheets.forEach(
			function(sheet){
				console.log("File found: "+sheet.name+" key:"+sheet.key);
				console.log("Fetch rows...");
				var promise = googleApi.getDataTable(sheet.key).then(weQuoteInsert);
				promiseArray.push(promise);
			});
	return promiseArray;
}

var rule = new schedule.RecurrenceRule();
var now = new Date();
now.addMinute();
rule.minute = now.getMinutes();

var j = schedule.scheduleJob(rule, function(){
	googleApi.getDataTable(config.indexId).then(getSheets).all();
    console.log('Schedulazione sheet2mongo at '+(new Date()));
});

console.log('Avvio sheet2mongo.');
console.log('Schedulazione al minuto '+rule.minute);

/*
var params = {
	search : "lasciare"
};
var testThen = function (result) {
	console.log(result);
};

wequoteApi.list(params).then(testThen);*/