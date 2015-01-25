
var config = require("./config");
var apiUrl = config.apiUrl;
var http = require('request');
var Q = require('q');
var _ = require('underscore');
var _s = require('underscore.string');
var MIN_LEN = 15;
var key = process.env.AUTH_KEY || 'dummykey';

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
				},
				headers: {
			        'X-AUTHKEY': key
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
				},
				headers: {
			        'X-AUTHKEY': key
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
	filter : function(quote)
	{
		var toRemove = false;
		
		// Autore con iniziali non alfanumeriche 
		if(quote.author.search(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßĀĂĄĆĈĊČĎĒĔĖĘĚĜĞĢĤ]/) !== 0) {						
			toRemove = true;
		}					
		
		// Testo troppo corto
		if (quote.text.length < MIN_LEN) {						
			toRemove = true;
		}
		
		_.each(quote.tags, function(tag) {
			tag.name = tag.name.toLowerCase().trim();
		});
		
		// Sistema testo
		// a) Non deve terminare per il carattere '.' (accetta però '...')
		// b) Non devono essere presenti le " intorno alla citazione
		// c) Trim
		if ((_s.startsWith(quote.text, '"')) && (_s.endsWith(quote.text, '"'))) {
			quote.text = quote.text.substring(1, quote.text.length - 1);
		}
		
		if ((_s.endsWith(quote.text, '.')) && (!_s.endsWith(quote.text, '...'))) {
			quote.text = quote.text.substring(0, quote.text.length - 1);
		}
		
		quote.text = _s.trim(quote.text);
		
		if (toRemove)
		{
			return null;
		}
		else
		{
			return quote;
		}
	},
	filterText : function(text)
	{
		
		// Sistema testo
		// a) Non deve terminare per il carattere '.' (accetta però '...')
		// b) Non devono essere presenti le " intorno alla citazione
		// c) Trim
		if ((_s.startsWith(text, '"')) && (_s.endsWith(text, '"'))) {
			text = text.substring(1, text.length - 1);
		}
		
		if ((_s.endsWith(text, '.')) && (!_s.endsWith(text, '...'))) {
			text = text.substring(0, text.length - 1);
		}
		
		text = _s.trim(text);
		
		return text;
	}
};