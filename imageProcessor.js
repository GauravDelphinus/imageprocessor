const execFile = require('child_process').execFile;
const execFileSync = require("child_process").execFileSync;
const tmp = require("tmp");
const config = require("./config");
const fs = require("fs");

module.exports = {
	convertImageFromPath: function (sourceImagePath, targetImagePath, imArgs, next) {
		imArgs.unshift(sourceImagePath);
		imArgs.push(targetImagePath);

		execFile("convert", imArgs, (error, stdout, stderr) => {
			if (error) {
		    	return next(error);
		  	} else {
		  		return next(0);
		  	}
	  	});
	},

	convertImageFromData: function (sourceImageData, imArgs, next) {
		const createTempFilename = this.createTempFilename;
		const dataURItoFile = this.dataURItoFile;
		const convertImageFromPath = this.convertImageFromPath;

		createTempFilename(function(err, sourceImagePath) {
			if (err) {
				return next(err);
			}

			createTempFilename(function(err, targetImagePath) {
				if (err) {
					return next(err);
				}

				dataURItoFile(sourceImageData, sourceImagePath, function(err) {
		  			if (err) {
		  				return next(err);
		  			}

		  			convertImageFromPath(sourceImagePath, targetImagePath, imArgs, function(err) {
		  				if (err) {
		  					return next(err);
		  				}

		  				const DataURI = require('datauri');
						const datauri = new DataURI();
						datauri.encode(targetImagePath, next);
		  			});
		  		});
			});
		});
	},

	//core routine that writes from a dataURI to a provided
	//file, and fails if the file doesn't exist
	dataURItoFile: function(dataURI, filename, callback) {
		var parseDataURI = require("parse-data-uri");
		var parsed = parseDataURI(dataURI);
					
		var buffer = parsed.data;

		fs.writeFile(filename, buffer, function(err) {
			return callback(err);
		});
	},

	//core routine to generate a new temp file name
	//callback returns either an err, or 0 along with the created path name
	createTempFilename: function(callback, prefix = "") {
		tmp.tmpName({ dir: global.appRoot + config.path.tmpDir, prefix: prefix }, function _tempNameGenerated(err, tmpPath) {
		    if (err) {
		    	return callback(err);
		    }
		 	
		 	return callback(0, tmpPath);
		});
	}
}