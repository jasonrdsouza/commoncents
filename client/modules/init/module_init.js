console.log("module_init.js")
// Object that will hold all of our module definitions
window.Modules = {};

// Gives access to parent context in child template.
Handlebars.registerHelper('defparent', function ( parent, options ) {
    if ( typeof parent !== 'object' ) {
        return '';
    }
    this['$_'] = parent;
    return options.fn( this );
});