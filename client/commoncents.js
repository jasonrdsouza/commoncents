Meteor.startup(function() {
	// Tell accounts to ask for username and email when signing up.
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
});

Template.myGroups.groups = function() {
	return TransactionGroups.find();
};

Template.tgroup.userIdList = function() {
	return _.map(this.users, function(u) {return u.userId;});
}