var xauth = new function() {
	
	this.getOnlyXauthedServices = function(services) {
		return $.map(services, function(e, i) {
			var source = OPENLIKE.Sources[e];
			if(source.xauth)
				return source;
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
