
var imageProcessor = require("./imageProcessor");
const cluster = require('cluster'); 
const logger = require("./logger");
var express = require("express");

var routes = function() {

	var router = express.Router();

	router.route("/convert") // /api/convert ROUTE

		.post(function(req, res){

			logger.debug("Cluster #" + cluster.worker.id + " - POST received on /api/convert");

			if (req.body.sourceImageData) {
				//received image data - first store data to local file
				imageProcessor.convertImageFromData(req.body.sourceImageData, req.body.imArgs, function(err, targetImageData) {
					logger.debug("callback from convertImageFromData, err: " + err);
					if (err) {
						return res.sendStatus(500); //something bad happened
					}

					let output = {
						targetImageData: targetImageData
					};
					logger.debug("returning to client, cluster #" + cluster.worker.id + ", calling res.json");
					return res.json(output);
				});
			} else if (req.body.sourceImagePath && req.body.targetImagePath) {
				//received image path - process directly
				imageProcessor.convertImageFromPath(req.body.sourceImagePath, req.body.targetImagePath, req.body.imArgs, function(err) {
					if (err) {
						console.log("Cluster #" + cluster.worker.id + 'encounteed some error: ' + err);
						return res.sendStatus(400);
					}

					let output = {
						targetImagePath: req.body.targetImagePath
					};

					console.log("Cluster #" + cluster.worker.id + "Success, sending status 200");
					return res.json(output);
				});
			}
			
			//invalid param
			//return res.sendStatus(400);
		});

	return router;
};

module.exports = routes;