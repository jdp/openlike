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
	
	this.checkServices = function(sources, callback) {
		
		XAuth.retrieve({
		  retrieve: $.map(sources, function(e, i) {
						return e.xauth;
					}),
		  callback: parseServicesWithTokens
		});

		function parseServicesWithTokens(data) {
			var tokens = data.tokens;
			 	verifiedSources = $.map(sources, function(e, i) {
					if(tokens[e.xauth].token)
						return e;
				});
			callback.call(null, verifiedSources);
		}
		
	}
	
};
