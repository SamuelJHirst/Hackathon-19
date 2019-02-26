$(document).ready(function() {
	var now = new Date();

	populate(now.getFullYear(), now.getMonth());
});

$("#back").on("click", function() {
	var month = parseInt($("#header").data("month")) - 1;

	if (month > -1) {
		$("#header").data("month", month);
	}
	else {
		month = 11;
		$("#header").data("month", month);
		$("#header").data("year", parseInt($("#header").data("year")) - 1);
	}

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	$("#header h3").html(months[month] + " " + $("#header").data("year"));

	populate(parseInt($("#header").data("year")), parseInt($("#header").data("month")));
});

$("#next").on("click", function() {
	var month = parseInt($("#header").data("month")) + 1;

	if (month < 12) {
		$("#header").data("month", month);
	}
	else {
		month = 0;
		$("#header").data("month", month);
		$("#header").data("year", parseInt($("#header").data("year")) + 1);
	}

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	$("#header h3").html(months[month] + " " + $("#header").data("year"));

	populate(parseInt($("#header").data("year")), parseInt($("#header").data("month")));
});

function populate(year, month) {
	var	start = new Date(year, month),
		col = start.getDay(),
		row = 1,
		i = 1,
		max = 0;

	$(".adjacent-month").removeClass("adjacent-month");
	$(".has-event").removeClass("has-event");
	$("#calendar td").html("");

	$("#header").data("year", year);
	$("#header").data("month", month);

	if (month === 1 && year % 4 === 0) {
		max = 29;
	}
	else if (month === 1) {
		max = 28;
	}
	else if (month === 8 || month === 5 || month === 3 || month === 10) {
		max = 30;
	}
	else {
		max = 31;
	}

	$.post("/events/", function(events) {
		while (i <= max) {
			if (col === 0) {
				col = 7;
			}
			var from = new Date(parseInt($("#header").data("year")), parseInt($("#header").data("month")), parseInt(i), 0, 0, 0).getTime();
			var to = new Date(parseInt($("#header").data("year")), parseInt($("#header").data("month")), parseInt(i), 23, 59, 59).getTime();
			for (var k of events) {
				if (parseInt(k.timestamp * 1000) > from && parseInt(k.timestamp * 1000) < to) {
					$("#calendar tr:nth-of-type(" + row + ") td:nth-of-type(" + col + ")").addClass("has-event");
				}
			}
			$("#calendar tr:nth-of-type(" + row + ") td:nth-of-type(" + col + ")").html(i);
			col += 1;
			i += 1;
			if (col > 7) {
				col = 1;
				row += 1;
			}
		} 

		i = 1;
		while (row < 7) {
			if (col === 0) {
				col = 7;
			}
			$("#calendar tr:nth-of-type(" + row + ") td:nth-of-type(" + col + ")").html(i);
			$("#calendar tr:nth-of-type(" + row + ") td:nth-of-type(" + col + ")").addClass("adjacent-month");
			col += 1;
			i += 1;
			if (col > 7) {
				col = 1;
				row += 1;
			}
		}

		var empty = $("#calendar td:empty").length;
		month -= 1;
		if (month === 1 && year % 4 === 0) {
			max = 29;
		}
		else if (month === 1) {
			max = 28;
		}
		else if (month === 8 || month === 5 || month === 3 || month === 10) {
			max = 30;
		}
		else {
			max = 31;
		}

		var p = max - $("#calendar td:empty").length + 1,
			across = 1,
			down = 1;
		while (p <= max) {
			if (across === 0) {
				across = 7;
			}
			$("#calendar tr:nth-of-type(" + down + ") td:nth-of-type(" + across + ")").html(p);
			$("#calendar tr:nth-of-type(" + down + ") td:nth-of-type(" + across + ")").addClass("adjacent-month");
			across += 1;
			p += 1;
			if (across > 7) {
				across = 1;
				down += 1;
			}
		}
	});
}

$(document).delegate(".adjacent-month", "click", function() {
	$("#modal-error").modal("show");
});

$(document).delegate("#calendar tr td:not(.adjacent-month)", "click", function() {
	var clicked = $(this);
	$.post("/events/", function(events) {
		var from = new Date(parseInt($("#header").data("year")), parseInt($("#header").data("month")), parseInt(clicked.html()), 0, 0, 0).getTime();
		var to = new Date(parseInt($("#header").data("year")), parseInt($("#header").data("month")), parseInt(clicked.html()), 23, 59, 59).getTime();
		var j = [];
		for (var k of events) {
			if (parseInt(k.timestamp * 1000) > from && parseInt(k.timestamp * 1000) < to) {
				j.push(k);
			}
		}
		if (j.length > 0) {
			$("#modal-events .modal-body").html("<div class=\"list-group\"></div>");
			for (var k of j) {
				$("#modal-events .modal-body .list-group").append("<a href=\"#\" id=\"event-button\" class=\"list-group-item list-group-item-action\" data-id=\"" + k.id + "\">" + k.name + "</a>");
			}
		}
		else {
			$("#modal-events .modal-body").html("<em>No events for this date.</em>");
		}
		$("#modal-events").modal("show");
		$("#modal-events h5 span").html(clicked.html() + " " + $("#header h3").html());
	});
});

$(document).delegate("#new", "click", function() {
	$("#modal-new h5 span").html($("#modal-events h5 span").html());
	$("#name").val("");
	$("#from").val("");
	$("#to").val("");
	$("#arrival").val(""),
	$("#duration").val("");
	$("#type select").val("");
	$("#modal-events").modal("hide");
	$("#modal-new").modal("show");
});

$(document).delegate("#submit", "click", function() {
	var data = {
		name: $("#name").val(),
		from: $("#from").val(),
		to: $("#to").val(),
		arrival: 0,
		duration: 0,
		type: $("#type select").val(),
		return: $("#return").is(":checked")
	};

	var arrival = $("#arrival").val(),
		duration = $("#duration").val();

	var i = arrival.split(":"),
		j = $("#modal-new h5 span").html().split(" "),
		months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		d = new Date(parseInt(j[2]), months.indexOf(j[1]), parseInt(j[0]), parseInt(i[0]), parseInt(i[1]));
	data.arrival = d.getTime() / 1000;

	var i = duration.split(":");
	data.duration = (parseInt(i[0]) * 60) + parseInt(i[1]);

	// Posting to Python Server Disabled on this Demonstration
	// $.post("/send/", data, function(data) {
		window.location = "/";
	// });
});

$(document).delegate("#event-button", "click", function() {
	$.post("/event/", {
		id: $(this).data("id")
	}, function(event) {
		$("#modal-event .modal-title").html(event.name);
		$("#modal-event h5+img").prop("src", "/img/" + event.weather + ".png");
		$("#modal-steps .modal-title").html(event.name + " - Steps");
		var d = new Date(parseInt(event.timestamp) * 1000);
		$("#modal-event .modal-body table tr:nth-of-type(1) td").html(("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear());
		$("#modal-event .modal-body table tr:nth-of-type(2) td").html(event.from);
		$("#modal-event .modal-body table tr:nth-of-type(3) td").html(event.to);
		$("#modal-event .modal-body table tr:nth-of-type(4) td").html(event.departure);
		$("#modal-event .modal-body table tr:nth-of-type(5) td").html(event.arrival);
		$("#modal-event .modal-body table tr:nth-of-type(6) td").html(event.duration);
		$("#modal-event .modal-body table tr:nth-of-type(7) td").html(event.distance);
		if (event.type == "walking") {
			$("#modal-event .modal-body table tr:nth-of-type(8) td").html("Walking");
		}
		else if (event.type == "driving") {
			$("#modal-event .modal-body table tr:nth-of-type(8) td").html("Driving");
		}
		else if (event.type == "bicycling") {
			$("#modal-event .modal-body table tr:nth-of-type(8) td").html("Cycling");
		}
		else {
			$("#modal-event .modal-body table tr:nth-of-type(8) td").html("Public Transport");
		}
		for (var step of event.steps) {
			$("#modal-steps .list-group").append("<li class=\"list-group-item\">" + step.instruction + "</li>")
		}
		$("#modal-events").modal("hide");
		$("#modal-event").modal("show");
	});
});

$(document).delegate("#event-steps", "click", function() {
	$("#modal-event").modal("hide");
	$("#modal-steps").modal("show");
});