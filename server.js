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
			quote = wequoteApi.filter(quote);
			if(quote!==null)
			{
				if(result === -1){
					wequoteApi.insert(quote).then(
							function(result){
								//console.log("insert quote:" + wequoteApi.filterText(row.quote));
								row.id=JSON.parse(result)._id;
								row.lastUpdate=new Date();
								row.save();
							}
					).fail(
							function(error){
								console.log("errore: insert" + error);
							}
					);
				}
				else
				{
					var id = result;
					wequoteApi.update(id,quote).then(
							function(){
								//console.log("update: quote:" + wequoteApi.filterText(row.quote));
								row.id=id;
								row.lastUpdate=new Date();
								row.save();
							}
					).fail(
							function(error){
								console.log("errore: update " + error);
							}
					);
				}
			}
		};
		params = {
				search : wequoteApi.filterText(row.quote)
		};
		if (row.id.length==0)
		{
			wequoteApi.list(params).then(insert);
		}
		else
		{
			insert(row.id);
		}

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
rule.hour = 21;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function(){
	googleApi.getDataTable(config.indexId).then(getSheets).all();
	console.log('Schedulazione sheet2mongo at '+(new Date()));
});

console.log('Avvio sheet2mongo.');
console.log('Schedulazione all\'ora : '+rule.hour);
console.log('Primo avvio...');
googleApi.getDataTable(config.indexId).then(getSheets).all();

/*
var params = {
	search : "lasciare"
};
var testThen = function (result) {
	console.log(result);
};

wequoteApi.list(params).then(testThen);*/