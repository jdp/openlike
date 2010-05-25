javascript:void(
	
	(function() {
		
		var assetHost = 'http://localhost/~justin/openlike';
		
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
			
			var title = (function() {
				if (og['og:title']) {
					return og['og:title'];
				}
				else {
					return document.title;
				}
			})();
			
			var vertical = (function() {
				if (og['og:type']) {
					return og['og:type'];
				}
				else {
					switch (document.location.host) {
						case 'techcrunch.com':
						case 'digg.com':
							return 'news';
						default:
							return 'default';
					}
				}
			})();
			

			var iframe = createIframe(assetHost+'/widget.html?url=' + encodeURIComponent(window.location.href) + '&title=' + encodeURIComponent(title) + '&vertical=' + encodeURIComponent(vertical)),
				el;
		
			addCss(assetHost+'/v2/css/openlike.css');
		
			switch(document.location.host) {
				case 'digg.com':
					el = document.getElementsByClassName('inline-share-actions')[0];
					el.parentNode.insertBefore(iframe, el);
					el.parentNode.removeChild(el);
					break;
				case 'techcrunch.com':
					el = document.getElementsByClassName('excerpt_subheader_right')[0];
					el.innerHTML = '';
					el.appendChild(iframe);
					break;
				case 'www.imdb.com':
					el = document.getElementById('tn15adrhs');
					el.insertBefore(iframe, el.firstChild);
					break;
				case 'www.rottentomatoes.com':
					el = document.getElementsByClassName('share_social_media')[0];
					el = el.getElementsByClassName('fr')[0];
					el.innerHTML = '';
					el.appendChild(iframe);
					break;
			}

		}
		
		addWidget();
		
	})()
	
);