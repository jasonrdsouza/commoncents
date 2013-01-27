console.log("commoncents.js");
(function(){

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

var u1 = Modules.SearchSelector.create("userSelector", "myGroups", Users, "_id", "username"),
	u2 = Modules.SearchSelector.create("userSelector2", "myGroups", Users, "_id", "username");

var registerCustomEvents = function() {
	var userSelected = Modules.SearchSelector.EVENTS.ITEM_SELECTED_EVENT;
	u1.on(userSelected, function(event) { alert("#1: " + event.item.name); });
	u2.on(userSelected, function(event) { alert("#2: " + event.item.name); });
};

Meteor.startup(function() {
	// Tell accounts to ask for username and email when signing up.
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
	// Custom events must ALWAYS be registered in Meteor.startup.
	registerCustomEvents();
});

})();