var express = require("express"),
	config = require("./config"),
	db = require("./db"),
	app = express(),
	session = require("express-session"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	swig = require("swig"),
	restler = require("restler");

app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/pub"));
app.use(cookieParser());
app.use(session({
	secret: 'anything',
	resave: false,
	saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view cache", false);
swig.setDefaults({cache: false});

app.locals = {};

app.get("/", function(req, res) {
	res.render("app", {});
});

app.get("*", function(req, res, next) {
	res.redirect("/");
});

app.post("/events/", function(req, res, next) {
	db.get("events.json").then(function(events) {
		res.send(events);
	});
});

app.post("/event/", function(req, res, next) {
	db.find("events.json", parseInt(req.body.id)).then(function(event) {
		res.send(event);
	});
});

// Posting to Python Server Disabled on this Demonstration
// app.post("/send/", function(req, res, next) {
// 	restler.get("http://localhost:" + config.backend, { data: req.body }).on("complete", function(data) {
// 		var trip = req.body;
// 		data = eval(data);
// 		trip.id = new Date().getTime();
// 		trip.duration = data[0].duration;
// 		trip.departure = data[0].departureTime;
// 		trip.timestamp = req.body.arrival;
// 		trip.arrival = data[0].arrivalTime;
// 		trip.distance = data[0].distance;
// 		trip.steps = data[0].instructions;
// 		trip.weather = data[0].weather[1];
// 		delete trip.return;
// 		console.log(data)
// 		db.add("events.json", trip).then(function() {
// 			if (data[1]) {
// 				var back = {
// 					id: new Date().getTime(),
// 					name: req.body.name + " (Return)",
// 					from: req.body.to,
// 					to: req.body.from,
// 					timestamp: trip.timestamp,
// 					duration: data[1].duration,
// 					departure: data[1].departureTime,
// 					arrival: data[1].arrivalTime,
// 					distance: data[1].distance,
// 					steps: data[1].instructions,
// 					weather: data[1].weather[1]
// 				};
// 				db.add("events.json", back).then(function() {
// 					res.sendStatus(200);
// 				});
// 			}
// 			else {
// 				res.sendStatus(200);
// 			}
// 		});
		
//     })
// });

var server = app.listen(config.port, function() {
	console.log("*******************");
	console.log("Application Running");
	console.log("-------------------");
	console.log("Web Port:      " + config.port);
	console.log("Backend Port:  " + config.backend);
	console.log("*******************");
});