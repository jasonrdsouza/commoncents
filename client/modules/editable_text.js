console.log("editable_text.js");
Modules.EditableText = {};
(function(){

// Template names
var MASTER_TEMPLATE = "editableText",

// CSS classes / prefixes
	CONTAINER_CLASS_PREFIX = "editable-text-",

// Constant prefixes for session vars
	CURRENTLY_EDITING = "editable-text-editing-",
	SAVED_TEXT = "editable-text-text-",

// Other constants
	CUSTOM_EVENTS = {},

// Helper functions
	set = function(moduleid, what, value) {
		Session.set(what+moduleid, value);
	},
	get = function(moduleid, what) {
		return Session.get(what+moduleid);
	}
	getContentBox = function(moduleid) {
		return $("."+CONTAINER_CLASS_PREFIX+moduleid);
	},

	saveTextAndClose = function(moduleid) {
		// Grab text from typed textbox, save it
		var text = getContentBox(moduleid).find("input.editable-text-input").val();
		set(moduleid, SAVED_TEXT, text);
		set(moduleid, CURRENTLY_EDITING, false);
	}

Template[MASTER_TEMPLATE].events({
	'click .editable-text-static': function(event) {
		var moduleid = this.moduleid,
			inputBox = getContentBox(moduleid).find("input.editable-text-input");
		inputBox.parent().removeClass("hidden");
		inputBox.focus();
		set(moduleid, CURRENTLY_EDITING, true);
	},

	'blur .editable-text-input': function(event) {
		saveTextAndClose(this.moduleid);
	},

	'keypress .editable-text-input': function(event) {
		// Only enter key
		if(event.which === 13) {
			$(event.target).blur();
		}
	}
});

Template[MASTER_TEMPLATE].isEditing = function() {
	return get(this.moduleid, CURRENTLY_EDITING);
};
Template[MASTER_TEMPLATE].actualText = function() {
	return get(this.moduleid, SAVED_TEXT);
};

// Method to call to set up a unique instance of a search selector
Modules.EditableText.create = function (identifier, parentTemplate, placeholderText) {
	var context = {
		moduleid: Meteor.uuid(),
		placeholderText: placeholderText || "click here to type"
	},
	moduleid = context.moduleid;
	set(moduleid, CURRENTLY_EDITING, false);
	set(moduleid, SAVED_TEXT, "");
	Template[parentTemplate][identifier] = context;

	return {
		definingClass: CONTAINER_CLASS_PREFIX+moduleid,
		getText: function() {
			return get(moduleid, SAVED_TEXT);
		},
		resetState: function() {
			set(moduleid, CURRENTLY_EDITING, false);
			set(moduleid, SAVED_TEXT, "");
			getContentBox(moduleid).find("input.editable-text-input").val("");
		}
	};
};
Modules.EditableText.EVENTS = CUSTOM_EVENTS;

})();

