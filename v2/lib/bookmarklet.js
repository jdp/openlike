javascript:void(
	
	(function(){
		
		function addJs(url) {
			
			var script = document.createElement('script');
			script.setAttribute('type','text/javascript');
			script.setAttribute('src', url);
			document.body.appendChild(script);
			return script;
			
		}
		
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

			var iframe = createIframe('http://localhost/openlike/index.html'),
				el;
		
			addJs('http://localhost/openlike/v2/js/openlike.dev.js');
			addCss('http://localhost/openlike/v2/css/openlike.css');
		
			switch(document.location.host) {
				case 'www.imdb.com':
					el = document.getElementById('tn15adrhs');
					el.insertBefore(iframe, el.firstChild);
					break;
			}

		}
		
		addWidget();
		
	})()
	
);