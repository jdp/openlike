var OPENLIKE = (function(ns) {
	
	// This won't work if it's the top window (should be in an iframe)
	if (window.top == window) {
		return;
	}
	
	// Merciful exit on unsupported browsers
	if (!window['postMessage'] || !window['localStorage'] || !window['JSON']) {
		return;
	}
	
	ns.Server = {
		
		/*
		 * User has requested his preferred services for a given vertical.
		 * Response object has an array of services.
		 * If the user doesn't have any preferred services, return the first 3 available.
		 */
		'openlike::getServices': function(request, origin_hostname) {
			var response = {};
			if (!request['widget-id']) {
				response['error'] = 'no widget id given';
				return response;
			}
			if (!request['vertical']) {
				response['error'] = 'no vertical given';
				return response;
			}
			if (!ns.Verticals[request['vertical']]) {
				response['error'] = 'invalid vertical '+request['vertical'];
				return response;
			}
			services = ns.Preferences.get(request['vertical']);
			if (services.length == 0) {
				services = ns.Verticals[request['vertical']].slice(0, 3);
			}
			response['id'] = request['id'];
			response['widget-id'] = request['widget-id'];
			response['cmd'] = 'openlike::services';
			response['services'] = services;
			return response;
		}
		
	};
	
	// Make sure response message has an id and send it on to parent window
	// origin is the URI of the window we're postMessaging to
	function sendResponse(response_object, origin) {
		if(!response_object || (typeof response_object.id != 'number') ) {
			console.error('send to', origin, 'failed!');
			return;
		}
		window.parent.postMessage(JSON.stringify(response_object), origin);
	}

	// Listener for window message events, receives messages from parent window
	function onMessage(event) {
		console.log('server message rcvd', event.data);
		
		// event.origin will always be of the format scheme://hostname:port
		// http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#dom-messageevent-origin
		var origin_hostname = event.origin.split('://')[1].split(':')[0],
			request_object = JSON.parse(event.data);

		if (!request_object || typeof request_object != 'object' 
			|| !request_object.cmd || request_object.id == undefined) {
			// A post message we don't understand
			return;
		}

		if(ns.Server[request_object.cmd]) {
			// A command we understand, send the response on back to the posting window
			var response = ns.Server[request_object.cmd](request_object, origin_hostname);
			sendResponse(response, event.origin);
		}
	}

	// Setup postMessage event listeners
	if (window.addEventListener) {
		window.addEventListener('message', onMessage, false);
	}
	else if (window.attachEvent) {
		window.attachEvent('onmessage', onMessage);
	}
	
	// Let parent window know server is ready
	window.parent.postMessage(JSON.stringify({cmd: 'openlike::ready'}), '*');
	
	return ns;
	
})(OPENLIKE || {});
