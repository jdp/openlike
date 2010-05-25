if (!window['OPENLIKE']) {
	
	window['OPENLIKE'] = new function() {
	
		this['Widget'] = function(cfg) {
	
			var cfg = cfg? cfg: {};
			cfg.url = cfg.url? cfg.url: window.location.href;
			
			var assetHost = document.location.href.match(/localhost/)? 'http://localhost/~justin/openlike': 'http://openlike.org';
	
			// Grab Open Graph metadata if possible
			var og = {};
			var meta_tags = document.getElementsByTagName('META');
			for (i = 0; i < meta_tags.length; i++) {
				var property = meta_tags[i].getAttribute('property');
				if (property && property.match(/^og:/)) {
					og[property] = meta_tags[i].getAttribute('content');
				}
			}
	
			// Determine vertical, priorities: config, open graph, 'default'
			cfg.vertical = (function() {		
				if (cfg.vertical) {
					return cfg.vertical;
				}
				else if (og['og:type']) {
					return og['og:type'];
				} else {
					return 'default';
				}
			})();
	
			// Determine title, priorities: config, open graph, document.title
			cfg.title = (function() {
				if (cfg.title) {
					return cfg.title;
				}
				else if (og['og:title']) {
					return og['og:title'];
				}
				else {
					return document.title;
				}
			})();

			var script = document.getElementsByTagName('SCRIPT');
			script = script[script.length - 1];
			iframe = document.createElement('IFRAME');
			iframe.src = (assetHost+'/widget.html?url=' + encodeURIComponent(cfg.url) + '&title=' + encodeURIComponent(cfg.title) + '&vertical=' + encodeURIComponent(cfg.vertical)); 
			script.parentNode.insertBefore(iframe, script);
	
		};
	
	}
	
}