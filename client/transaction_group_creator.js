console.log("transaction_group_creator.js");
(function(){

// Note: purposely not designing this to be able to be instantiated more than once since I don't think we'll ever need it.

var groupNameEditor = Modules.EditableText.create("groupName", "addTgroup", "Click to enter group name");
var userSearchSelector = Modules.SearchSelector.create("userSelector", "addTgroup", Users, "_id", "username", "type to add a user");

Template.addTgroup.events({
	'click #addGroup': function() {
		var groupName = groupNameEditor.getText(),
			list = $(".addTgroup-addedUsers");
			memberList = _.map(list.find("input[type=hidden]"), function(li) {return li.value;});

		Meteor.call("createTransactionGroup", groupName, memberList, function(error, result) {
			if(!error) {
				list.find(".user-li").remove();
				groupNameEditor.resetState();
				userSearchSelector.clearText();
			}
		});
	}
});

var registerCustomEvents = function() {
	var userSelected = Modules.SearchSelector.EVENTS.ITEM_SELECTED_EVENT;

	userSearchSelector.on(userSelected, function(event) {
		var list = $(".addTgroup-addedUsers");

		if(_.every(list.find("input[type=hidden]"), function(li) { return li.value !== event.item.id; })) {
			$(Template.addedUser(event.item)).hide().appendTo(list).fadeIn(400);
			list.find(".delete").one("click", function(e) {
				$(e.target).closest(".user-li").fadeOut(400, function() { $(this).remove(); });
			});
		}
	});
};

Meteor.startup(function() {
	// Custom events must ALWAYS be registered in Meteor.startup.
	registerCustomEvents();
});

})();