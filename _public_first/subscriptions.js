console.log("subscriptions.js");

Users = Meteor.users;
TransactionGroups = new Meteor.Collection("transactionGroups");
RequestGroups = new Meteor.Collection("requestGroups");
Notifications = new Meteor.Collection("notifications");

Subs = {
	/* Self is an argument to all these functions with the intent that, when called,
	 * self = this object (Subs). That way, other methods from this object are accessible
	 * to each individual method.
	 * 
	 * That is an argument to all these function which is intended to be replaced by "this"
	 * (e.g., when writing this.userId). Since we're declaring subscriptions in this object
	 * and then iterating over them below to create them, we need to provide the correct
	 * context scope for "this", and we call it that.
	 */

	// Allow the client to know anyone's username.
	userData: function(self, that) {
		return Users.find({}, {fields: {'username': 1, 'uniqueName': 1}});
	},

	// All transaction groups that you are a part of.
	myGroups: function(self, that) {
		return TransactionGroups.find({users: {'$elemMatch': {userId: that.userId, dateLeft: null}}});
	}
};

// Publish on server, subscribe on client.
_.each(_.pairs(Subs), function(pair) {
	var subName = pair[0],
		subFunc = pair[1];
	if (Meteor.isServer) {
		Meteor.publish(subName, function() { return subFunc(Subs, this); });
	}
	if (Meteor.isClient) {
		Meteor.subscribe(subName);
	}
});