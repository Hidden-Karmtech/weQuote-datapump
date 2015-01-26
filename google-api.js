var http = require('request'),
    googleSpreadsheet = require("google-spreadsheet"),
    config = require("./config");
var Q = require('q');

module.exports = {
	getDataTable : function(id)
	{
	    var deferred = Q.defer();
		var mySheet = new googleSpreadsheet(id);
		mySheet.setAuth(config.googleUsername,config.googlePassword, function(err){
			mySheet.getRows(config.outputPageNumber ,function(err, rowData){
				//console.log(rowData.length);
				deferred.resolve(rowData);
			});
		});
		return deferred.promise;
	}
};
