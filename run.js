//get required packages
//express,ngrok and opn package used
const express = require('express');
upload = require("express-fileupload");
const app = express();
var path = require('path');
const ngrok = require('ngrok');
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({
	extended: true
}));
app.use(upload());
var fs = require('fs');
var opn = require('opn');
var sendjson = {};
var requestjson = {};

//makes a upload folder. if the server has recieved files it will be stored in this folder
if (!fs.existsSync("./upload")) {
	fs.mkdirSync("./upload");
}

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


async function runngrok() {
	var datetime = new Date();
	var datestr = datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
	console.log(datestr);


	// using ngrok for a domain name and fetching it. since it takes time we use 'await' to wait for a reply
	const ngrokurl = await ngrok.connect(80);
	console.log("ngrok url : " + ngrokurl);




	//all the html post request routes

	app.post('/send.html', (req, res) => {
		var datetime = new Date();
		datestr = " at " + datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
		console.log("made link to send " + req.body.fname + datestr);
		var i, k;

		for (i = 0; i < req.body.fname.length; i++) {
			if (req.body.fname[i] === '\\') {
				k = i
			}
		}

		var thefile = req.body.fname.slice(k + 1)
		var thepath = req.body.fname
		res.redirect('/send.html');
		try {
			if (fs.existsSync(thepath)) {
				sendjson[thefile] = thepath;
			} else {
				sendjson[thefile] = "Doesn't exist";
			}
		} catch (err) {
			console.log(err);
		}
	});



	app.post('/request.html', (req, res) => {
		var datetime = new Date();
		datestr = " at " + datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
		console.log("made link to request for " + req.body.fname + datestr);
		var thefile = req.body.fname
		var theuname = req.body.uname
		res.redirect('/request.html');
		requestjson[thefile] = theuname;
	});

	app.post('/upload/*', (req, res) => {
		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			(req.connection.socket ? req.connection.socket.remoteAddress : null);
		var datetime = new Date();
		datestr = " at " + datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
		console.log("receiving a file" + " from " + ip + datestr);
		if (req.files) {
			var file = req.files.file,
				filename = file.name;

			file.mv("./upload/" + filename, function (err) {
				if (err) {
					console.log(err);
					res.send("error occured");
				} else {
					res.json({
						"message": "File Uploaded"
					});
					var datetime = new Date();
					datestr = " at " + datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
					console.log("received " + filename + " from " + ip + datestr);
				}

			});

		}
	});

	//all the html post request routes
	app.get('/favicon.ico', (req, res) => {
		res.end();
	});




	app.get('/download/:file(*)', (req, res) => {
		var fileLocation = sendjson[req.params.file];

		//fetching ip address of client
		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			(req.connection.socket ? req.connection.socket.remoteAddress : null);

		var datetime = new Date();
		datestr = " at " + datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
		console.log("got request to download " + req.params.file + " from " + ip + datestr);



		/*
		If you wish to use pipes to transfer very big files at constant speed using pipes reliably
		then uncomment the lines below and comment the line "res.download(fileLocation,y);" immediately after this.

		var speed = = {highWaterMark: Math.pow(2,23)}; //this is for 1 MegaBytes per second.Change as per your internet bandwidth
		var stream = fs.createReadStream(fileLocation,speed);
		res.attachment(y);
		stream.pipe(res);
		*/


		res.download(fileLocation, req.params.file);
	});


	app.get('/upload/:file(*)', (req, res) => {

		if (requestjson.hasOwnProperty(req.params.file) == 1) {
			var ip = req.headers['x-forwarded-for'] ||
				req.connection.remoteAddress ||
				req.socket.remoteAddress ||
				(req.connection.socket ? req.connection.socket.remoteAddress : null);
			var datetime = new Date();
			datestr = " at " + datetime.toISOString().slice(0, 10) + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();
			console.log("link to upload " + req.params.file + " visited by " + ip + datestr);
			res.render(path.join(__dirname, '/views/', "uploader.html"), {
				ngrokurl: ngrokurl,
				text: req.params.file,
				uname: requestjson[req.params.file]
			});
		} else {
			res.send("Access denied. Wrong url.");
		}

	});



	app.get('/:file(*)', (req, res) => {
		var file = req.params.file;

		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			(req.connection.socket ? req.connection.socket.remoteAddress : null);

		//check if request is made locally. If not then deny access
		if (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
			if (file === "") {
				file = "index.html"
			}

			var fileLocation = path.join(__dirname, '/views/', file);

			if (file === "index.html") {
				res.render(fileLocation, {
					ngrokurl: ngrokurl
				});
			}

			if (file === "send.html") {
				res.render(fileLocation, {
					ngrokurl: ngrokurl,
					j: sendjson
				});
				for (var key in sendjson) {
					if (sendjson[key] === "Doesn't exist") {
						delete sendjson[key];
					}
				}
			}

			if (file === "request.html") {
				res.render(fileLocation, {
					ngrokurl: ngrokurl,
					j: requestjson
				});
			}

		} else {
			res.end("for security reasons this page can only be accessed locally.\n\nIf this is the machine hosting the server try using \"localhost\" or \"127.0.0.1\".");
		}

		//console.log("request for "+file+" from "+ip);
	});

	//default port for website
	app.listen(80);

	//opn package used to open portal browser automatically
	opn("localhost", {
		app: 'chrome'
	});
}
runngrok();