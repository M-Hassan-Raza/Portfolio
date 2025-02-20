(function() {
    // Store the original console methods
    const originalConsole = {
        error: console.error,
        warn: console.warn
    };

    // Custom error handler
    function customErrorHandler(error) {
        
        // Uncomment to see errors during development
        // originalConsole.error(error);
        
        return false; // Prevents the error from showing in console
    }

    // Override console methods
    console.error = function() {
        return customErrorHandler(arguments);
    };
    
    console.warn = function() {
        return customErrorHandler(arguments);
    };

    // Catch unhandled errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        return customErrorHandler(error);
    };

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        event.preventDefault();
        return customErrorHandler(event.reason);
    });
})();