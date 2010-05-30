;(function() {
	
	// This won't work if it's the top window (should be in an iframe)
	if (window.top == window) {
		return;
	}
	
	// Merciful exit on unsupported browsers
	if (!window['postMessage'] || !window['localStorage'] || !window['JSON']) {
		return;
	}
	
	var OpenlikeServer = {
		
		/*
		 * User has requested his preferred services for a given vertical.
		 * Response object has an array of services.
		 * If the user doesn't have any preferred services, return the first 3 available.
		 */
		'openlike::getServices': function(request) {
			var response = {};
			if (!request['vertical']) {
				response['error'] = 'no vertical given';
				return response;
			}
			return response;
		}
		
	}
	
})();
