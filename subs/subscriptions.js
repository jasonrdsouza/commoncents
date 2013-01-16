Users = Meteor.users;
Transactions = new Meteor.Collection("transactions");
TransactionSets = new Meteor.Collection("transactionSets");
TransactionGroups = new Meteor.Collection("transactionGroups");
RequestGroups = new Meteor.Collection("requestGroups");
Notifications = new Meteor.Collection("notifications");
Test = new Meteor.Collection("test");

Subs = {
	// Allow the client to know anyone's username.
	userData: function() {
		return Users.find({}, {fields: {'username': 1}});
	}
};

// Publish on server, subscribe on client.
_.each(_.pairs(Subs), function(pair) {
	var subName = pair[0],
		subFunc = pair[1];
	if (Meteor.isServer) {
		Meteor.publish(subName, subFunc);
	}
	if (Meteor.isClient) {
		Meteor.subscribe(subName);
	}
});