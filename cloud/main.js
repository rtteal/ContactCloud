Parse.Cloud.beforeSave("Request", function(request, response) {
    Parse.Cloud.useMasterKey(); // allows us to update the user table without being logged in
    var to = request.object.get("to");
    var contactObj = request.object.get("fromUser");
	
	// push related variables
	var recipients = new Parse.Query(Parse.Installation);
    var message = "";

    if (request.object.get("approved") === true) {
		recipients.equalTo("username", request.object.get("from"));
		message = "Your contact request to " + request.object.get("to") + " was approved!";
        contactObj.fetch({
            success: function(contact) {
                var userQuery = new Parse.Query(Parse.User);
                userQuery.equalTo("username", to);
                userQuery.find({
                    success: function(user) {
                        var theUser = user[0];
                        var relation = theUser.relation("contacts");
                        relation.add(contact);
                        theUser.save(null, {
                            success: function(theUser) {
                                response.success();
                            },
                            error: function(theUser, error) {
                                console.log("Error: " + error.message);
                                response.error(error.message);
                            }
                        });
                    },
                    error: function(user, error) {
                        console.log("Error: " + error.message);
                        response.error(error.message);
                    }
                });
            },
            error: function(contact, error) {
                console.log("Error: " + error.message);
                response.error(error.message);
            }
        });
    } else {
		recipients.equalTo("username", request.object.get("to"));
		message = "You got a contact request from " + request.object.get("from");
        contactObj.fetch({
            success: function(contact) {
                var userQuery = new Parse.Query(Parse.User);
                userQuery.equalTo("username", to);
                userQuery.find({
                    success: function(user) {
                        var theUser = user[0];
                        var relation = theUser.relation("contacts");
                        relation.remove(contact);
                        theUser.save(null, {
                            success: function(theUser) {
                                response.success();
                            },
                            error: function(theUser, error) {
                                console.log("Error: " + error.message);
                                response.error(error.message);
                            }
                        });
                    },
                    error: function(user, error) {
                        console.log("Error: " + error.message);
                        response.error(error.message);
                    }
                });
            },
            error: function(contact, error) {
                console.log("Error: " + error.message);
                response.error(error.message);
            }
        });
    }

    Parse.Push.send({
        where: recipients,
        data: {
            alert: message
        }
    });
});

Parse.Cloud.beforeDelete("Request", function(request, response) {
    Parse.Cloud.useMasterKey(); // allows us to update the user table without being logged in
    var to = request.object.get("to");
    var contactObj = request.object.get("fromUser");
    contactObj.fetch({
        success: function(contact) {
            var userQuery = new Parse.Query(Parse.User);
            userQuery.equalTo("username", to);
            userQuery.find({
                success: function(user) {
                    var theUser = user[0];
                    var relation = theUser.relation("contacts");
                    relation.remove(contact);
                    theUser.save(null, {
                        success: function(theUser) {
                            response.success();
                        },
                        error: function(theUser, error) {
                            console.log("Error: " + error.message);
                            response.error(error.message);
                        }
                    });
                },
                error: function(user, error) {
                    console.log("Error: " + error.message);
                    response.error(error.message);
                }
            });
        },
        error: function(contact, error) {
            console.log("Error: " + error.message);
            response.error(error.message);
        }
    });
	
});
