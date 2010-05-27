if (!window['OPENLIKE']) {
	
	window['OPENLIKE'] = new function() {
	
		this['Widget'] = function(cfg) {
			
			var cfg = cfg? cfg: {};
			cfg['url'] = cfg['url']? cfg['url']: window.location.href;
			
			var assetHost = document.location.href.match(/openlike.org/)? 'http://openlike.org': document.location.href.match(/.*\/openlike/);
	
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
			cfg['vertical'] = (function() {		
				if (cfg['vertical']) {
					return cfg['vertical'];
				}
				else if (og['og:type']) {
					return og['og:type'];
				} else {
					return 'news';
				}
			})();
	
			// Determine title, priorities: config, open graph, document.title
			cfg['title'] = (function() {
				if (cfg['title']) {
					return cfg['title'];
				}
				else if (og['og:title']) {
					return og['og:title'];
				}
				else {
					return document.title;
				}
			})();
			
			var widget_count = document.getElementsByClassName('openlike-widget').length;
			
			// Event listener should only be attached the first time the widget is added
			if (widget_count == 0) {
				// Receive messages from widgets messages
				function onMessage(event) {
					var msg = JSON.parse(event.data);
					var widget_iframe = event.source.frameElement;
					switch (msg['cmd']) {
						case 'openlike::ready':
							console.log('openlike widget '+widget_iframe.id+' ready!');
							event.source.postMessage(JSON.stringify({
								'cmd': 'openlike::requestResize'
							}), event.origin);
							break;
						case 'openlike::resize':
							console.log('resizing '+widget_iframe.id+' to '+msg['width']); 
							widget_iframe.style.width = msg['width'] + 'px';
							break;
					}
					console.log(event);
					return false;
				}
				window.addEventListener('message', onMessage, false);
			}

			var script = document.getElementsByTagName('SCRIPT');
			script = script[script.length - 1];
			var iframe = document.createElement('IFRAME');
			iframe.src = (assetHost+'/widget.html?url=' + encodeURIComponent(cfg['url']) + '&title=' + encodeURIComponent(cfg['title']) + '&vertical=' + encodeURIComponent(cfg['vertical'])); 
			iframe.style.height = '33px';
			iframe.className = 'openlike-widget';
			iframe.id = 'openlike-widget-' + (widget_count + 1);
			script.parentNode.insertBefore(iframe, script);
	
		};
	
	}
	
}