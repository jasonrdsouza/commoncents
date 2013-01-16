Meteor.startup(function() {
	// Tell accounts to ask for username and email when signing up.
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL"
	});
});

Users = Meteor.users;
Meteor.subscribe("userData");

Template.userList.users = function() {
	return Users.find({}, {username: 1, emails: 1});
};