// Use Parse.Cloud.define to define as many cloud functions as you want.
Parse.Cloud.define("hello", function(request, response) {
    response.success("Hello world! Emily is testing 4");
});

Parse.Cloud.afterSave("Request", function(request) {
    var recipients = new Parse.Query(Parse.Installation);
    var message = "";

    if (request.object.get("approved")) {
	recipients.equalTo("username", request.object.get("from"));
	message = "Your contact request to " + request.object.get("to") + " was approved!";
    } else {
	recipients.equalTo("username", request.object.get("to"));
	message = "You got a contact request from " + request.object.get("from");
    }

    Parse.Push.send({
	where: recipients,
	data: {
	    alert: message
	}
    });
});
