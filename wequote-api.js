
var config = require("./config");
var apiUrl = config.apiUrl;
var http = require('request');
var Q = require('q');

module.exports = {
	list : function(params){
	    var deferred = Q.defer();
	    http.get(
			{
				url: apiUrl + "/quoteExists",
				qs: {
					search: params.search
				},
				json:true
			},
			function(error, response, result){
				if(error){
					deferred.reject(error);
				}else{
					deferred.resolve(result);
				}
			}
			
		);
		return deferred.promise;
	},
	insert : function(quote){
	    var deferred = Q.defer();
		http.post(
			{
				url: apiUrl + "/insert",
				form: {
					quote: quote 
				}
			},
			function(error, response, result){
				if(error){
					deferred.reject(error);
				}else{
					deferred.resolve(result);
				}
			}
			
		);
		return deferred.promise;
	},
	update : function(id,quote){
	    var deferred = Q.defer();
		http.put(
			{
				url: apiUrl + "/update",
				form: {
					quoteId:id,
					newQuote: quote
				}
			},
			function(error, response, result){
				if(error){
					deferred.reject(error);
				}else{
					deferred.resolve(result);
				}
			}
			
		);
		return deferred.promise;
	}
};