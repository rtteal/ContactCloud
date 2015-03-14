Parse.Cloud.beforeSave("Request", function(request, response) {
    Parse.Cloud.useMasterKey(); // allows us to update the user table without being logged in
    var to = request.object.get("to");
    var contactObj = request.object.get("fromUser");

    if (request.object.get("approved") === true) {
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