javascript:void(
	
	(function() {
		
		var assetHost = 'http://localhost/~justin/openlike/';
		
		function addCss(url) {
			
			var script = document.createElement('link');
			script.setAttribute('type','text/css');
			script.setAttribute('rel', 'stylesheet');
			script.setAttribute('href', url);
			document.body.appendChild(script);
			return script;
			
		}
		
		function createIframe(url) {
			
			var iframe = document.createElement('iframe');
			iframe.src = url;
			iframe.className = 'openlike';
			return iframe;
			
		}
		
		function addWidget() {
			
			var og = {};
			var meta_tags = document.getElementsByTagName('META');
			for (i = 0; i < meta_tags.length; i++) {
				var property = meta_tags[i].getAttribute('property');
				if (property && property.match(/^og:/)) {
					og[property] = meta_tags[i].getAttribute('content');
				}
			}
			
			var vertical = (function() {
				if (og['og:type']) {
					return og['og:type'];
				}
				else {
					switch (document.location.host) {
						/*
						case 'www.imdb.com':
							return 'movie';
						*/
						case 'www.huffingtonpost.com':
						case 'www.cnn.com':
							return 'news';
						default:
							return 'default';
					}
				}
			})();
			

			var iframe = createIframe(assetHost+'index.html?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(document.title) + '&vertical=' + encodeURIComponent(vertical)),
				el;
		
			addCss(assetHost+'v2/css/openlike.css');
		
			switch(document.location.host) {
				case 'www.imdb.com':
					el = document.getElementById('tn15adrhs');
					el.insertBefore(iframe, el.firstChild);
					break;
				case 'www.huffingtonpost.com':
					el = document.getElementsByClassName('fb_like_contain')[0];
					el.parentNode.insertBefore(iframe, el);
					el.parentNode.removeChild(el);
					break;
				case 'www.cnn.com':
					el = document.getElementsByClassName('cnn_strylccimg300')[0];
					el.appendChild(iframe);
					break;
			}

		}
		
		addWidget();
		
	})()
	
);