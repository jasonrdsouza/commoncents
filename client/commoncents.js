console.log("commoncents.js");

Meteor.startup(function() {
	// Tell accounts to ask for username and email when signing up.
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
});

// TODO remove - for testing purposes only with calls to Meteor.call or Meteor.apply
meteorMethodsDebug = function(error,result) { console.log(error); };

Template.myGroups.groups = function() {
	return TransactionGroups.find();
};
Template.myGroups.events({
	'click #addGroup': function() {
		var groupName = $('#addGroupName').val(),
			memberList = [];
		Meteor.call("createTransactionGroup", groupName, memberList, /*TODO: remove*/meteorMethodsDebug);
	}
});
u1 = Modules.SearchSelector("userSelector", "myGroups", Users, "_id", "username");
u2 = Modules.SearchSelector("userSelector2", "myGroups", Users, "_id", "username");