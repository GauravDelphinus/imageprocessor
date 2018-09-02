
var imageProcessor = require("./imageProcessor");
const cluster = require('cluster'); 
const logger = require("./logger");
var express = require("express");
const fileUtils = require("./fileUtils");

var routes = function() {

	var router = express.Router();

	router.route("/processimage") // /api/processimage ROUTE

		.get(function(req, res){

			logger.debug("Cluster #" + cluster.worker.id + " - GET received on /api/processimage");

			if (req.body.imArgs && req.body.imArgs.constructor === Array && req.body.imArgs.length > 0) {
				imageProcessor.normalizeArgs(req.body.imArgs, function(err, normalizedArgs, inputTmpFiles, outputTmpFile) {
					if (err) {
						return res.sendStatus(500);
					}

					imageProcessor.execute(req.body.command, normalizedArgs, outputTmpFile, function(err, result) {
						if (err) {
							return res.sendStatus(500);
						}

						if (inputTmpFiles && inputTmpFiles.length > 0) {
							fileUtils.deleteTmpFiles(inputTmpFiles);
						}
						
						if (outputTmpFile) {
							fileUtils.deleteTmpFiles(outputTmpFile);
						}

						let output = {
							stdout: result.stdout,
							outputFileData: result.outputFileData
						};

						return res.json(output);
					});
				});
			} else {
				return res.sendStatus(400); //invalid parameters
			}
		});

	return router;
};

module.exports = routes;