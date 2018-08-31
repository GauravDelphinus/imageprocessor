'use strict';

const helmet = require("helmet");
const cluster = require('cluster'); 
const config = require("./config");
const path = require("path");

module.exports = function(callback) {
	
	const express = require('express');
	const bodyParser = require('body-parser');

	const app = express();
	global.appRoot = path.normalize(path.resolve(__dirname) + "./");


	app.enable('trust proxy');
	
	// Add cookie parsing functionality to our Express app
	app.use(require('cookie-parser')());

	// Parse JSON body and store result in req.body
	app.use(bodyParser.json({limit: "50mb"})); //make sure we can handle large messages that include images.  The actual value may require fine tuning later
	app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

	app.use(helmet()); //for security - https://expressjs.com/en/advanced/best-practice-security.html

	const router = require("./routes")();
	app.use("/api", router);

	// Finally, start listening for requests
	app.listen(config.port, function() {
		//logger.info("Node Server, Environment: " + dynamicConfig.nodeEnv + ", Listening on " + dynamicConfig.nodeHostname + ", port " + config.port + ", Connected to Neo4j Database: " + dynamicConfig.dbHostname);
		//logger.info("Application Root: " + global.appRoot);
		console.log("Started Cluster #" + cluster.worker.id + " - Listening on port " + config.port)
		return callback(null, app);
	});
};


