const tmp = require("tmp");
const config = require("./config");
const fs = require("fs");
const logger = require("./logger");

module.exports = {
	
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
	},

	/**
		Delete any temp files that were created during the image processing
	**/
	deleteTmpFiles: function(tmpFiles) {
		if (tmpFiles.constructor === Array) {
			for (let i = 0; i < tmpFiles.length; i++) {
				fs.unlink(tmpFiles[i]);
			}
		} else {
			fs.unlink(tmpFiles);
		}
	}
};