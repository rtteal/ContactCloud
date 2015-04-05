Parse.Cloud.beforeSave("Request", function(request, response) {
    Parse.Cloud.useMasterKey(); // allows us to update the user table without being logged in
    var to = request.object.get("to");
    var fromUser = request.object.get("fromUser");
	
	// push related variables
	var recipients = new Parse.Query(Parse.Installation);
    var message = "";

    if (request.object.get("approved") === true) {
		recipients.equalTo("username", request.object.get("from"));
		message = "Your contact request to " + request.object.get("to") + " was approved!";
        fromUser.fetch({
            success: function(contact) {
                var userQuery = new Parse.Query(Parse.User);
                userQuery.equalTo("username", to);
                userQuery.find({
                    success: function(user) {
                        var toUser = user[0];
                        var relation = toUser.relation("contacts");
                        relation.add(contact);
                        toUser.save(null, {
                            success: function(toUser) {
								var roleName = "friendsOf_" + contact.get("User").id;
								var roleQuery = new Parse.Query("_Role");
								roleQuery.equalTo("name", roleName);
								roleQuery.first().then(function(role) {
									role.getUsers().add(toUser);
									return role.save();
								}).then(function(toUser) {
									response.success();    
								});
                            },
                            error: function(toUser, error) {
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
        fromUser.fetch({
            success: function(contact) {
                var userQuery = new Parse.Query(Parse.User);
                userQuery.equalTo("username", to);
                userQuery.find({
                    success: function(user) {
                        var toUser = user[0];
                        var relation = toUser.relation("contacts");
                        relation.remove(contact);
                        toUser.save(null, {
                            success: function(toUser) {
                                response.success();
                            },
                            error: function(toUser, error) {
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
    var fromUser = request.object.get("fromUser");
    fromUser.fetch({
        success: function(contact) {
            var userQuery = new Parse.Query(Parse.User);
            userQuery.equalTo("username", to);
            userQuery.find({
                success: function(user) {
                    var toUser = user[0];
                    var relation = toUser.relation("contacts");
                    relation.remove(contact);
                    toUser.save(null, {
                        success: function(toUser) {
                            response.success();
                        },
                        error: function(toUser, error) {
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

Parse.Cloud.afterSave(Parse.User, function(request, response) {
	Parse.Cloud.useMasterKey();
    var user = request.object;
    if (user.existed()) { return; }
    var roleName = "friendsOf_" + user.id;
    var friendRole = new Parse.Role(roleName, new Parse.ACL(user));
    return friendRole.save().then(function(friendRole) {
        var acl = new Parse.ACL();
        acl.setReadAccess(friendRole, true);
        acl.setReadAccess(user, true);
        acl.setWriteAccess(user, true);
        var contactInfo = new Parse.Object("ContactInfo", {
          User: user,
          ACL: acl
        });
		user.set("ContactInfo", contactInfo);
		user.save();
        return contactInfo.save();
    });
});
