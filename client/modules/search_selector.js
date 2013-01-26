console.log("search_selector.js");

// Events for typing changes
Template.searchSelector.events({
	'keyup .search-selector-searchBox': function(event) {
		var typed = $(event.target).val(),
			searchRE = typed && typed.length > 0 ?
				"^.*"+typed.toLowerCase()+".*$" :
				".*";
		Session.set("search-selector-searchRE-"+this.uniqueId, searchRE);
	}
});

// Data source for displaying search results
Template.searchSelector.data = function() {
	var query = {},
		nameField = this.nameField,
		id = this.uniqueId,
		dataColl = this.searchDataCollection;
	query[nameField] = {'$regex': new RegExp(Session.get("search-selector-searchRE-"+id))};
	return dataColl.find(query);
};

// Method to call to set up a unique insteance of a search selector
Modules.SearchSelector = function (identifier, parentTemplate, searchDataCollection, idField, nameField) {
	var searchSelector = {
		uniqueId: Meteor.uuid(),
		searchDataCollection: searchDataCollection,
		idField: idField,
		nameField: nameField
	};
	Session.set("search-selector-searchRE-"+searchSelector.uniqueId, ".*");

	Template[parentTemplate][identifier] = searchSelector;
};