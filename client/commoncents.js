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

Template.userSelector.users = function() {
	return Users.find({uniqueName: {'$regex': new RegExp(Session.get("searchRE"))}});;
};
Template.userSelector.events({
	'keyup #userTextBox': function() {
		var typed = $('#userTextBox').val(),
			searchRE = typed && typed.length > 0 ?
				"^.*"+typed.toLowerCase()+".*$" :
				".*";
		Session.set("searchRE", searchRE);
	}
});
