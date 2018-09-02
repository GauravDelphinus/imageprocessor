const execFile = require('child_process').execFile;
const tmp = require("tmp");
const config = require("./config");
const fs = require("fs");
const logger = require("./logger");
const async = require("async");
const fileUtils = require("./fileUtils");

module.exports = {
	/**
		Process the input IM arguments and look for any input and output files

		Input files must be in the form of image data, so convert those to tmp files by
		writing the image data to a temp file

		Output file (at max 1) must be just a tag "output", so create a tmp file that
		we can use to write the output to.
	**/
	normalizeArgs: function(imArgs, callback) {
		var functionList = [];
		for (let i = 0; i < imArgs.length; i++) {
			functionList.push(async.apply(this.processOneArg, imArgs[i]));
		}

		async.series(functionList, function(err, finalArgs) {
			if (err) {
				return callback(err);
			}

			let inputTmpFiles = [];
			let outputTmpFile = null;
			let normalizedArgs = [];

			/**
				Process the input arguments, and normalize them into flag ImageMagic acceptable
				arguments.  Use the INPUT_FILE or OUTPUT_FILE tags to figure out which files were
				created as tmp files so we can pass them back to the caller for deletion after the
				processing is completed.
			**/
			for (let i = 0; i < finalArgs.length; i++) {
				if (finalArgs[i].type == "INPUT_FILE") {
					inputTmpFiles.push(finalArgs[i].value);
				} else if (finalArgs[i].type == "OUTPUT_FILE") {
					if (outputTmpFile != null) {
						//Error - cannot have more than one output file
						return callback(new Error("Cannot have more than one OUTPUT_FILE in the imArgs"));
					}
					outputTmpFile = finalArgs[i].value;
				}

				normalizedArgs.push(finalArgs[i].value);
			}

			return callback(null, normalizedArgs, inputTmpFiles, outputTmpFile);
		});
	},

	/**
		Process each arg in the input imArg list.

		If the input is of type image data, create a temp file to store that image,
		and tag that arg as an INPUT_FILE

		If the input is just the strings "OUTPUT_FILE", create a temp file for this argument
		and tag it as OUTPUT_FILE

		Otherwise, just tag it as a REGULAR_ARGUMENT
	**/
	processOneArg: function(imArg, callback) {	
		if (String(imArg).startsWith("data:image/")) {
			fileUtils.createTempFilename(function(err, tmpFileName) {
				if (err) {
					return callback(err);
				}

				fileUtils.dataURItoFile(imArg, tmpFileName, function(err) {
					if (err) {
						return callback(err);
					}

					return callback(null, {type: "INPUT_FILE", value: tmpFileName});
				});
			});
		} else if (String(imArg).startsWith("OUTPUT_FILE")) {
			fileUtils.createTempFilename(function(err, tmpFileName) {
				if (err) {
					return callback(err);
				}

				return callback(null, {type: "OUTPUT_FILE", value: tmpFileName});
			});
		} else {
			return callback(null, {type: "REGULAR_ARGUMENT", value: imArg});
		}
	},

	/**
		Actual, final call to execute the system command.  Be very careful to make
		sure that the input command and normalizedArgs are going to be compatible with
		ImageMagick running on this computer.

		TODO: Add validation checks on inputs.
	**/
	execute: function(command, normalizedArgs, outputTmpFile, callback) {		
		execFile(command, normalizedArgs, (err, stdout, stderr) => {
			if (err) {
		    	return callback(err);
		  	} else {
		  		if (outputTmpFile) {
		  			//In case the output was a tmp file, create the image data
		  			//from the output and pass back to caller, so we can send back to client.
		  			const DataURI = require('datauri');
					const datauri = new DataURI();
					datauri.encode(outputTmpFile, function(err, outputFileData) {
						if (err) {
							return callback(err);
						}

						return callback(null, {stdout: stdout, outputFileData: outputFileData});
					});
		  		} else {
		  			return callback(null, {stdout: stdout, outputFileData: null});
		  		}
		  	}
	  	});
	  	
	}
};