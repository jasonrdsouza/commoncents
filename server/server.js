/*
NOTE:
IF YOU CHANGE THE FORMAT OF THE DOCUMENTS IN EACH TABLE, PLEASE UPDATE THE COMMENTS IN THIS FILE!
*/

/*                                          
======================================================================================
users							
	_id				unique id across all users
	firstName
	lastName
	userName
	uniqueName 		lowercase version of userName for easier username uniqueness checking on db
	emails			list of complex objects
		address 		email address
		verified		true if this email has been verified for the user
	deleted			time - left the website
	lastLogin		time - may be useful to log
	isActivated		true if they haven't signed up on the site yet (the non-user idea)
	prefs 			object - some key-value pairs for settings we may decide later

Comments:
	The master user table.
	Note that meteor already provides a user table with email and userName. The rest of these fields
	will be merged into that table.
*/
UsersService = {
	/*
	Soft-delete a user.
	Assumes userId exists in the users table.
	*/
	deleteUser: function(userId) {
		Users.update({_id: userId},
			{$set: {
				deleted: (new Date()).getTime()
			}}
		);
	}

};
// Tell accounts to send a verification email to the user.
Accounts.config({sendVerificationEmail: true});
// Validate usernames.
Accounts.validateNewUser(function(user) {
	var MAX_USERNAME_LEN = 16;
	if(user.username.length > MAX_USERNAME_LEN) {
		throw new Meteor.Error(500, "Username must be no longer than 16 characters.");
	}
	if(user.username.search(/[^A-Za-z0-9]/) >= 0) {
		throw new Meteor.Error(500, "Username may only contain alphanumeric characters.");
	}
	if(user.username.search(/[A-Za-z]/) === -1) {
		throw new Meteor.Error(500, "Username must contain at least one letter.");
	}
	// TODO: validate email more throughly than Accounts currently does. "123 @gmail.com" breaks it, for example.
	// Distinct username, ignoring case
	if(Users.findOne({uniqueName: user.uniqueName})) {
		throw new Meteor.Error(500, "Username already exists.");
	}
	return true;
});
// Tell accounts to create user objects that are more complex than the default.
Accounts.onCreateUser(function(options, user) {
	user.profile = options.profile; // Default behavior.
	// Lowercase-ify the email
	_.each(user.emails, function(emailObj) { emailObj.address = emailObj.address.toLowerCase(); });
	// Other intializations for our own setup
	user.uniqueName = user.username.toLowerCase();
	user.firstName = "";
	user.lastName =  "";
	user.deleted = null;
	user.lastLogin = (new Date()).getTime();
	user.isActivated = true;
	user.prefs = {};
	return user;
});


/*
======================================================================================
userFriends		
	_id	
	userId			unique id across all users
	friendId		user id of friend
	isFavorite		true if userId wants friendId as a favorite friend
								
Comments:
	Table for answering the question "who are my friends"
	This table isn't really important right now, nor does this need to be the final design.
	This table may just be merged as a list property on the users table.
*/

// Omitting this until we implement it.





/*
======================================================================================	
transactionGroups							
	_id 				unique id across all transaction groups
	createdBy			user who created this group
	creatorDisplayName 	name of creator - cached here so we can display without a lookup on Users
	dateCreated			date this was created
	title				some sort of title for this group
	users 				list of complex objects
		userId				id of user who is a member of this transaction group
		userDisplayName 	name of user - cached here so we can display without a lookup on Users
		dateJoined			date this user joined this group
		dateLeft			date this user left this group
		permissionLevel		some identifier for a permission level about how this user
								wants to deal with transactions in this transaction group
	transactionSets 	list of complex objects
		title			title for this transaction set, i.e. "dinner at the nines"
		description		additional info entered by creator, i.e. "trivia night was awesome!!"
		trxDate			date this occurred
		approved 		boolean true if transaction approved by all users to which it applies
		transactions 	list of complex objects
			userOwed		userId of user who is owed <amount> by userOwing
			userOwing		userId of user who owes <amount> to userOwed
			amount			cost, in dollars, of transaction

Comments:
	Table for transaction group metadata and user membership.

	TransactionSets holds what can be thought of as "events" where friends create a set of debt among
	each other because of someone paying for others.

	Each transactionSet has a set of transactions.
	A "transaction" is the simplest unit of debt, where A owes B some amount.

	JC NOTE:
	In a relational database model, there would be no "list of complex object"s as fields for a
	transaction group, and we would have a separate table for TransactionSets, Transactions, etc.
	I've merged these to support the mongo-style of database. 
	Without separate tables, imagine the following query:
	"All transactions that are in groups that I am a part of".
	Step 1: my groups 		= query TransactionGroups for groups I am a member of.
	Step 2: my sets 		= query TransactionSets for all sets belonging to my groups.
	Step 3: my transactions = query Transactions for all transactions belonging to my sets.
	This is terrible, and not to mention the list of "my sets" could get enormous, and I imagine the $in operator
	is not that efficient in mongo; it isn't in SQL, anyway.
*/
TransactionGroupsService = {

	/* Create a new transaction group with no transaction sets.
	 * userId: Id of the creator of the group
	 * title: title for the group (e.g., "Cornell buddies!")
	 * memberIds: array of userIds of members of the group. userId must be in this list.
	 */
	createNew: function(userId, title, memberIds) {
		var memberNames = {},
			distinctMemberIds;

		// sanity check: memberIds must include userId.
		if(!_.any(memberIds, function(mId) { return mId === userId; })) {
			throw new Meteor.Error(500, "The list of members for a transaction group must contain the creator of the group.");
		}

		// validation: all members must exist and be active in the Users table
		// use this opportunity to get their usernames for caching
		_.each(memberIds, function(mId) {
			var memb = Users.findOne({_id: mId});
			if (!memb) {
				throw new Meteor.Error(500, "Every member in a new transaction group must exist.");
			}
			memberNames[mId] = memb.username;
		});
		distinctMemberIds = _.keys(memberNames);

		// validation: a group must have 2 or more people
		if(distinctMemberIds.length < 2) {
			throw new Meteor.Error(500, "A transaction group must contain at least 2 members.");
		}

		// validation: title must not be empty
		if(title.length === 0) {
			throw new Meteor.Error(500, "Transaction group title must not be empty.");
		}

		var creationDate = (new Date()).getTime(),
			creatorName = memberNames[userId],
			members = _.map(distinctMemberIds, function(mId) {
				return {
					userId: mId,
					userDisplayName: memberNames[mId],
					dateJoined: creationDate,
					dateLeft: null,
					permissionLevel: "all" // TODO: permissioning
				}
			});

		TransactionGroups.insert({
			createdBy: userId,
			creatorDisplayName: creatorName,
			dateCreated: creationDate,
			title: title,
			users: members,
			transactionSets: []
		});
	}
};

// TODO Remove, put in better spot
Meteor.methods({
	createTransactionGroup: function(title, memberIds) {
		TransactionGroupsService.createNew(this.userId, title, memberIds);
	}
});


/*
======================================================================================
requestGroups							
	_id 			unique id across all request groups
	requestType		identifier for "allow new group member", "new transaction to approve", etc.
	isActive 		boolean true if result of request group is still pending
	... 			other relevant info
	requests 		list of complex objects
		userFrom		user who generated this request
		userFor			user who must respond to this request
		handled			true if userFor has already done what is necessary to respond to this request

Comments:
	This is a way to define a "request group" so it is known when a set of users has all
	approved some action pertaining to them.
*/
RequestGroupsService = {

};



/*
======================================================================================
notifications					
	_id 			unique id across all notifications
	userFor			user recieving this notification
	type			type of notification (mainly for determining message that is displayed, perhaps other functionality)
	isUnseen		true if user has not yet viewed this notification
	...				other data for this notification, definitely will be necessary 
						(e.g., what request does this pertain to, if it does), requires more thought

Comments:
	Similar to the requests table, but this is more of a user-facing layer on top of that
	so that users can manage requests that pertain to them.
======================================================================================
*/
NotificationsService = {

};