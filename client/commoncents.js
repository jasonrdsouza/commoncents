console.log("commoncents.js");
(function(){

// TODO remove - for testing purposes only with calls to Meteor.call or Meteor.apply
meteorMethodsDebug = function(error,result) { console.log(error); };

Template.myGroups.groups = function() {
	return TransactionGroups.find();
};

Template.tgroup.isExpanded = function() {
	return Session.get("group-expanded-"+this._id) ? "" : "hidden";
};
Template.tgroup.events({
	'click .group-title': function(event) {
		var groupid = this._id,
			curState = Session.get("group-expanded-"+groupid),
			slideDiv = $(event.target).closest(".transaction-group").find(".group-more-info").first();
		// Some tiny h4x to get jquery to play nice with handlebars.
		// If currently hidden, we will be showing, so remove hidden class placed by handlebars but keep display:none
		// so slideToggle still thinks it is closed
		if(!curState) {
			slideDiv.css("display", "none");
			slideDiv.removeClass("hidden");
		}
		slideDiv.slideToggle(300, function() {
			Session.set("group-expanded-"+groupid, !curState);
		});
	}
});

var e1 = Modules.EditableText.create("groupName", "addTgroup", "Click to enter group name");

Template.addTgroup.events({
	'click #addGroup': function() {
		var groupName = e1.getText(),
			list = $(".addTgroup-addedUsers");
			memberList = _.map(list.find("input[type=hidden]"), function(li) {return li.value;});

		Meteor.call("createTransactionGroup", groupName, memberList, function(error, result) {
			if(!error) {
				list.find(".user-li").remove();
				e1.resetState();
			}
		});
	}
});

var u1 = Modules.SearchSelector.create("userSelector", "addTgroup", Users, "_id", "username");

var registerCustomEvents = function() {
	var userSelected = Modules.SearchSelector.EVENTS.ITEM_SELECTED_EVENT;

	u1.on(userSelected, function(event) {
		var list = $(".addTgroup-addedUsers");

		if(_.every(list.find("input[type=hidden]"), function(li) { return li.value !== event.item.id; })) {
			list.append(Template.addedUser(event.item));
			list.find(".delete").one("click", function(e) {
				$(e.target).closest(".user-li").remove();
			});
		}
	});
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