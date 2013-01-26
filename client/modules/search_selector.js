console.log("search_selector.js");
(function(){

// Child templates
var MASTER_TEMPLATE = "searchSelector",
	ITEM_TEMPLATE = "searchSelector_item";

// CSS classes / prefixes
var CONTAINER_CLASS_PREFIX = "search-selector-",
	ITEM_CLASS = "search-selector-li",
	SELECTED_CLASS = "selected";

// Constant prefixes for session vars
var SEARCH_REGEX = "search-selector-searchregex-",
	SELECTED_ITEM = "search-selector-selected-",
	RESULTS_SHOWING = "search-selector-showing-";

// Helper functions for the below
var isUpKey = function(keyCode) {
		return keyCode == 38;
	},
	isDownKey = function(keyCode) {
		return keyCode == 40;
	},
	isBackspaceKey = function(keyCode) {
		return keyCode == 8;
	},
	getSearchRegexFromTextbox = function(event) {
		
	},
	fireSearch = function(event, that, fromKeyPress) {
		var textBoxText = $(event.target).val(),
			typed, searchRegex;
		typed = textBoxText + (fromKeyPress ? String.fromCharCode(event.charCode) : "");
		searchRegex = typed.length > 0 ? "^.*"+typed.toLowerCase()+".*$" : ".*";
		Session.set(SEARCH_REGEX+that.uniqueId, searchRegex);
	},
	getContainer = function(myId) {
		return $("."+CONTAINER_CLASS_PREFIX+myId);
	};
	

// Events for typing changes
Template[MASTER_TEMPLATE].events({
	'blur .search-selector-searchbox': function(event) {
		Session.set(RESULTS_SHOWING+this.uniqueId, false);
	},

	'focus .search-selector-searchbox': function(event) {
		$(event.currentTarget).val("");
		Session.set(RESULTS_SHOWING+this.uniqueId, true);
	},

	// Only captures typeable keys. i.e., those that would put a character in a textbox
	// The one exception is the enter key (keyCode 13)
	'keypress .search-selector-searchbox': function(event) {
		if(event.which !== 13) {
			fireSearch(event, this, true);
		}
		else {
			// Enter key - find selected item and fill text box with the name for that item, and close the results
			var moduleid = this.uniqueId,
				selectedId = Session.get(SELECTED_ITEM+moduleid),
				selectedName;
			if(selectedId) {
				selectedName = $.trim(getContainer(moduleid)
					.find("input[value="+selectedId+"]")
					.prev("div."+SELECTED_CLASS).html());
				getContainer(moduleid).find(".search-selector-searchbox").val(selectedName);
				Session.set(RESULTS_SHOWING+this.uniqueId, false);
			}
		}
	},

	// Captures all keys
	'keyup .search-selector-searchbox': function(event) {
		var moduleid = this.uniqueId;
		if(isBackspaceKey(event.which)) {
			fireSearch(event, this, false);
			return;
		}
		else if(isUpKey(event.which)) {
			// Look for the previous hidden input on the same DOM level, if it exists
			var prevSelect = getContainer(moduleid)
				.find("input[value="+Session.get(SELECTED_ITEM+moduleid)+"]")
				.prevAll("input").first();
			if(prevSelect.length > 0) {
				Session.set(SELECTED_ITEM+moduleid, prevSelect.val());
			}
		}
		else if(isDownKey(event.which)) {
			// Look for the next hidden input on the same DOM level, if it exists
			var nextSelect = getContainer(moduleid)
				.find("input[value="+Session.get(SELECTED_ITEM+moduleid)+"]")
				.nextAll("input").first();
			if(nextSelect.length > 0) {
				Session.set(SELECTED_ITEM+moduleid, nextSelect.val());
			}
		}
	}
});

// Data source for displaying search results
Template[MASTER_TEMPLATE].data = function() {
	var query = {}, options = {sort:{}},
		nameField = this.nameField,
		idField = this.idField,
		moduleid = this.uniqueId,
		dataColl = this.searchDataCollection;
	// Formulate search query
	query[nameField] = {'$regex': new RegExp(Session.get(SEARCH_REGEX+moduleid))};
	options.sort[nameField] = 1;

	// If this is being called, the results are being re-rendered, so reset the selected item to the first returned result
	var firstoptions = {sort: options.sort, limit: 1};
	var firstresult = dataColl.findOne(query, firstoptions);
	Session.set(SELECTED_ITEM+moduleid, firstresult ? firstresult[idField] : null);

	// Return all results.
	return dataColl.find(query, options);
};

Template[MASTER_TEMPLATE].resultsShowing = function() {
	return Session.get(RESULTS_SHOWING+this.uniqueId) ? "" : "hidden";
}

// Returns "selected" css class if calling item is the selected one.
Template[ITEM_TEMPLATE].selected = function() {
	var moduleid = this.$_.uniqueId,
		itemid = this[this.$_.idField];
	return Session.get(SELECTED_ITEM+moduleid) === itemid ? "selected" : "";
};
Template[ITEM_TEMPLATE].displayName = function() {
	return this[this.$_.nameField];
};
Template[ITEM_TEMPLATE].itemId = function() {
	return this[this.$_.idField];
};

// Method to call to set up a unique instance of a search selector
Modules.SearchSelector = function (identifier, parentTemplate, searchDataCollection, idField, nameField) {
	var searchSelector = {
		uniqueId: Meteor.uuid(),
		searchDataCollection: searchDataCollection,
		idField: idField,
		nameField: nameField
	};
	Session.set(SEARCH_REGEX+searchSelector.uniqueId, ".*");
	Session.set(RESULTS_SHOWING+searchSelector.uniqueId, false);
	Template[parentTemplate][identifier] = searchSelector;

	return {
		getSelectedItem: function() {
			return Session.get(SELECTED_ITEM+searchSelector.uniqueId);
		}
	};
};
})();