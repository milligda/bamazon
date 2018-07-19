// ==============================================================================
// Required Files
// ==============================================================================

var database = require('./database.js');

// ==============================================================================
// Connect to Database Function
// ==============================================================================

module.exports = function connect() {
    database.connect(function(err) {
        
        // display any connection error messages
        if (err) throw err;
    });
}