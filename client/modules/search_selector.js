console.log("search_selector.js");
(function(){

// Child templates
var MASTER_TEMPLATE = "searchSelector",
	ITEM_TEMPLATE = "searchSelector_item",

// CSS classes / prefixes
	CONTAINER_CLASS_PREFIX = "search-selector-",
	ITEM_CLASS = "search-selector-li",
	SELECTED_CLASS = "selected",

// Constant prefixes for session vars
	SEARCH_REGEX = "search-selector-searchregex-",
	HIGHLIGHTED_ITEM = "search-selector-highlighted-",
	SELECTED_ITEM = "search-selector-chosen-"
	RESULTS_SHOWING = "search-selector-showing-",

// Other constants
	MAX_RESULTS_SHOWING = 4,

// Helper functions for the below
	isUpKey = function(keyCode) {
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
	fireSearch = function(event, moduleid, fromKeyPress) {
		var textBoxText = $(event.target).val(),
			typed, searchRegex;
		typed = textBoxText + (fromKeyPress ? String.fromCharCode(event.charCode) : "");
		searchRegex = typed.length > 0 ? "^"+typed.toLowerCase()+".*$" : null;
		Session.set(SEARCH_REGEX+moduleid, searchRegex);
		// Search was fired, so we want to show the results
		Session.set(RESULTS_SHOWING+moduleid, true);
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
		fireSearch(event, this.uniqueId, false);
	},

	// Only captures typeable keys. i.e., those that would put a character in a textbox
	// The one exception is the enter key (keyCode 13)
	'keypress .search-selector-searchbox': function(event) {
		var moduleid = this.uniqueId;
		if(event.which !== 13) {
			fireSearch(event, moduleid, true);
			// Invalidate current selection because searchterm has changed
			Session.set(SELECTED_ITEM+moduleid, null);
		}
		else {
			// Enter key - find selected item and fill text box with the name for that item, and close the results
			var selectedId = Session.get(HIGHLIGHTED_ITEM+moduleid),
				selectedName;
			if(selectedId) {
				selectedName = $.trim(getContainer(moduleid)
					.find("input[value="+selectedId+"]")
					.siblings("input[name=dataName]").val());
				getContainer(moduleid).find(".search-selector-searchbox").val(selectedName);
				Session.set(RESULTS_SHOWING+moduleid, false);
				Session.set(SELECTED_ITEM+moduleid, selectedId);
			}
		}
	},

	// Captures all keys
	'keyup .search-selector-searchbox': function(event) {
		var moduleid = this.uniqueId;
		if(isBackspaceKey(event.which)) {
			fireSearch(event, moduleid, false);
			// Invalidate current selection because searchterm has changed
			Session.set(SELECTED_ITEM+moduleid, null);
			return;
		}
		else if(isUpKey(event.which)) {
			// Look for the previous hidden input on the same DOM level, if it exists
			var selectedId = Session.get(HIGHLIGHTED_ITEM+moduleid),
				prevSelect = getContainer(moduleid)
					.find("input[value="+selectedId+"]").parent()
					.prev().find("input[name=dataId]").first();
			if(prevSelect.length > 0) {
				Session.set(HIGHLIGHTED_ITEM+moduleid, prevSelect.val());
			}
		}
		else if(isDownKey(event.which)) {
			// Look for the next hidden input on the same DOM level, if it exists
			var selectedId = Session.get(HIGHLIGHTED_ITEM+moduleid),
				nextSelect = getContainer(moduleid)
					.find("input[value="+selectedId+"]").parent()
					.next().find("input[name=dataId]").first();
			if(nextSelect.length > 0) {
				Session.set(HIGHLIGHTED_ITEM+moduleid, nextSelect.val());
			}
		}
	}
});

// Data source for displaying search results
Template[MASTER_TEMPLATE].data = function() {
	var query = {}, options = {sort:{}, limit: MAX_RESULTS_SHOWING},
		nameField = this.nameField,
		idField = this.idField,
		moduleid = this.uniqueId,
		dataColl = this.searchDataCollection,
		regexstring = Session.get(SEARCH_REGEX+moduleid);

	if(regexstring) {
		// Formulate search query
		query[nameField] = {'$regex': new RegExp(regexstring)};
		options.sort[nameField] = 1;

		// If this is being called, the results are being re-rendered, so reset the selected item to the first returned result
		var firstoptions = {sort: options.sort, limit: 1};
		var firstresult = dataColl.findOne(query, firstoptions);
		Session.set(HIGHLIGHTED_ITEM+moduleid, firstresult ? firstresult[idField] : null);

		// Return all results.
		return dataColl.find(query, options);
	}
	else {
		Session.set(HIGHLIGHTED_ITEM+moduleid, null);
		Session.set(RESULTS_SHOWING+this.uniqueId, false);
	}
};

Template[MASTER_TEMPLATE].resultsShowing = function() {
	return Session.get(RESULTS_SHOWING+this.uniqueId) ? "" : "hidden";
};

Template[MASTER_TEMPLATE].selectionMade = function() {
	return Session.get(SELECTED_ITEM+this.uniqueId);
};

Template[ITEM_TEMPLATE].events({
	'mousedown': function(event) {
		var moduleid = this.$_.uniqueId,
			itemId = this[this.$_.idField],
			itemName = this[this.$_.nameField];

		getContainer(moduleid).find(".search-selector-searchbox").val(itemName);
		Session.set(SELECTED_ITEM+moduleid, itemId);
	},

	'mouseover .search-selector-item': function(event) {
		var moduleid = this.$_.uniqueId,
			itemId = this[this.$_.idField];
		Session.set(HIGHLIGHTED_ITEM+moduleid, itemId);
	}
});

// Returns "selected" css class if calling item is the selected one.
Template[ITEM_TEMPLATE].selected = function() {
	var moduleid = this.$_.uniqueId,
		itemid = this[this.$_.idField];
	return Session.get(HIGHLIGHTED_ITEM+moduleid) === itemid ? "highlighted" : "";
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
	Session.set(SEARCH_REGEX+searchSelector.uniqueId, null);
	Session.set(SELECTED_ITEM+searchSelector.uniqueId, null);
	Session.set(RESULTS_SHOWING+searchSelector.uniqueId, false);
	Template[parentTemplate][identifier] = searchSelector;

	return {
		getSelectedItem: function() {
			return Session.get(SELECTED_ITEM+searchSelector.uniqueId);
		}
	};
};
})();