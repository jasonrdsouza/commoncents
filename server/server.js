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
	emails			list of {address: string, verified: boolean} objects
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
	},


};
// Tell accounts to send a verification email to the user.
Accounts.config({sendVerificationEmail: true});
// Tell accounts to create user objects that are more complex than the default.
Accounts.onCreateUser(function(options, user) {
	user.profile = options.profile; // Default behavior.
	console.log(options);
	// Other intializations for our own setup
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
transactions							
	_id 			unique id across all transactions
	setId			"transaction set" to which this transaction belongs
	userOwed		userId of user who is owed <amount> by userOwing
	userOwing		userId of user who owes <amount> to userOwed
	amount			cost, in dollars, of transaction

Comments:
	A "transaction" is the simplest unit of debt, where A owes B some amount.
*/
TransactionsService = {

};


/*
======================================================================================
transactionSets							
	_id				unique id across all transaction sets
	groupId			"transaction group" to which this transaction set belongs
	approved 		boolean true if transaction approved by all users to which it applies
	title			title for this transaction set, i.e. "dinner at the nines"
	description		additional info entered by creator, i.e. "trivia night was awesome!!"
	trxDate			date this occurred
	...
	
Comments:
	This holds what can be thought of as "events" where friends create a set of debt among
	each other because of someone paying for others.
	We could merge the transactions table as a list property on entries of this table,
	but I'd prefer to keep it separate for now so that aggregate operations on transactions
	are easier. We can decide to change it later if we deem it a better idea.
*/
TransactionSetsService = {

};


/*
======================================================================================	
transactionGroups							
	_id 			unique id across all transaction groups
	createdBy		user who created this group
	dateCreated		date this was created
	title			some sort of title for this group
	users 			list of complex objects
		userId			id of user who is a member of this transaction group
		dateJoined		date this user joined this group
		dateLeft		date this user left this group
		permissionLevel	some identifier for a permission level about how this user
							wants to deal with transactions in this transaction group

Comments:
	Table for transaction group metadata and user membership.
*/
TransactionGroupsService = {

};


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