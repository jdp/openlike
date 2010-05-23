var xauth = new function() {
	
	/*
	 * Takes an array of service names, and gives back the names of the given
	 * services that can be authenticated through XAuth.
	 * @param Array<String> services The names of the services to check for XAuth authentication ability
	 * @return Array<String> The names of the services that can be authenticated through XAuth
	 */
	this.getAvailableServices = function(services) {
		return $.map(services, function(e, i) {
			if(OPENLIKE.Sources[e].xauth) {
				return e;
			}
		});
	}
	
	/*
	 * Takes an array of service names and authenticates them against XAuth.
	 * Also takes a callback for when authentication is complete, which as
	 * an argument takes an array of service names that were successfully authenticated.
	 * @param Array<String> List of service names to authenticate
	 * @param Function Callback to call when authentication is complete
	 */
	this.checkServices = function(sources, callback) {
		
		XAuth.retrieve({
			retrieve: $.map(sources, function(e, i) {
				return OPENLIKE.Sources[e].xauth;
			}),
			callback: parseServicesWithTokens
		});

		function parseServicesWithTokens(data) {
			var verifiedSources = $.map(sources, function(e, i) {
				if(data.tokens[OPENLIKE.Sources[e].xauth]) {
					return e;
				}
			});
			callback.call(null, verifiedSources);
		}
		
	}
	
};
