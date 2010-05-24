// TODO - add full support for the "open graph" meta elements
// TODO - add more specifics to each service, such as buzz "imageurl"
if (!window.OPENLIKE) {
	window.OPENLIKE = {
		assetHost: 'http://openlike.org',
		util: {
			update: function() {
				var obj = arguments[0], i = 1, len=arguments.length, attr;
				for (; i<len; i++) {
					for (attr in arguments[i]) {
						obj[attr] = arguments[i][attr];
					}
				}
				return obj;
			},
			escape: function(s) {
				return ((s == null) ? '' : s)
					.toString()
					.replace(/[<>"&\\]/g, function(s) {
						switch(s) {
							case '<': return '&lt;';
							case '>': return '&gt;';
							case '"': return '\"';
							case '&': return '&amp;';
							case '\\': return '\\\\';
							default: return s;
						}
					});
			},
			notundef: function(a, b) {
				return typeof(a) == 'undefined' ? b : a;
			},
			toggleClass: function(el, klass) {
				var regexpr = new RegExp('\\b'+klass+'\\b');
				if (el.className.match(regexpr)) {
					el.className = el.className.replace(regexpr, '');
				}
				else {
					el.className += ' '+klass;
				}
			}
		}
	};
}

if (!OPENLIKE.Widget) {
	
	OPENLIKE.ThreadedStatementState = function(cfg) {
		
		// Params for cfg
		//
		//   header -- the header text (or none) to give the widget (default 'Like this:')
		//   s -- array -- list of sites to share to (has a default)
		//   css -- string (or false) -- url for the css (optional, *only used in first OPENLIKE.Widget call*)
		//   url -- string -- the url of the object to like (default window.location.href)
		//   title -- string -- the title of the object to like (default document.title)
		//   type -- string -- the type of the object to like, e.g. product, activity, sport, bar, company (optional)
		var getParams = getGetParams(),
		 	defaults = {
				url: getParams.url,
				title: getParams.title,
				header: 'Like this:',
				css: OPENLIKE.assetHost + '/v1/openlike.css',
				s: (function() {
					return OPENLIKE.Verticals[getParams.vertical && getParams.vertical != ''? getParams.vertical: 'default'];
				})()
			},
			i, len, wrapper, title, list, li, a, source,
			css;
		cfg = OPENLIKE.util.update(defaults, cfg);
		
		// create an object from GET params
		function getGetParams() {
		    var vars = [], hash;
		    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		    for(var i = 0; i < hashes.length; i++) {
		        hash = hashes[i].split('=');
		        vars[hash[0]] = decodeURIComponent(hash[1]);
		    }
		    return vars;
		}
		
		// Build that widget
		function build(enabled_services) {
			// Add CSS
			if (!OPENLIKE.Widget._initialized) {
				OPENLIKE.Widget._initialized = true;
				if (cfg.css) {
					css = document.createElement('LINK');
					css.rel = 'stylesheet';
					css.type = 'text/css';
					css.href = cfg.css;
					(document.getElementsByTagName('HEAD')[0] || document.body).appendChild(css);
				}
			}

			// Get current script object
			var script = document.getElementsByTagName('SCRIPT');
			script = script[script.length - 1];

			// Build Widget
			wrapper = document.createElement('DIV');
			wrapper.id = 'openlike-widget';
			wrapper.className = 'openlike';
			wrapper.setAttribute('data-vertical', cfg.vertical)
			if (cfg.header) {
				title = document.createElement('P');
				title.innerHTML = OPENLIKE.util.escape(cfg.header);
				wrapper.appendChild(title);
			}

			list = document.createElement('UL');
			for (i=0, len=cfg.s.length; i<len; i++) {
				if (source = OPENLIKE.Sources[cfg.s[i]]) {
					source = OPENLIKE.prepSource(cfg.s[i], source);
					li = document.createElement('LI');
					if (source.html) {
						a = source.html(cfg);
					}
					else {
						a = document.createElement('A');
						a.className = source.klass;
						if (enabled_services.indexOf(source.name) > -1) {
							a.className += ' enabled';
						}
						a.href = '#';
						a.innerHTML = OPENLIKE.util.escape(source.name);
						if (source.title) {
							a.title = source.title;
						}
						if (source.basicLink) {
							a.href = source.basicLink(a, cfg);
							a.target = source.target;
						}
						a.onclick = (function(src) {
							return function(e) {
								var widget = document.getElementById('openlike-widget');
								// If in edit mode, button clicks enable/disable sources
								if (widget.className.match(/\bedit\b/)) {
									OPENLIKE.util.toggleClass(this, 'enabled');
									e.preventDefault();
									return false;
								}
								// Some services share through popup, accommodate them
								if (src.popup) {
									window.open(this.href, src.popup.target, src.popup.attrs);
									e.preventDefault();
									return false;
								}
								if (src.like) {
									// yet to be seen, use for glue addon?
									//src.like(cfg);
								}
								return false;
							};
						})(source);
					}
					li.appendChild(a);
					list.appendChild(li);
				}
			}
			wrapper.appendChild(list);
		
			var editBtn = document.createElement('a');
			editBtn.id = 'openlike-edit-btn';
			editBtn.onclick = function() {
				OPENLIKE.Ui.toggleEditMode();
			}
			editBtn.appendChild(document.createTextNode('edit'));
			wrapper.appendChild(editBtn);

			script.parentNode.insertBefore(wrapper, script);
			wrapper = title = list = li = script = source = null;
		}
		
		// Determine, of the defaults, which to use
		// in this order: preferred, xauthed, viewed, default
		var preferred_services = OPENLIKE.Preferences.get(cfg.vertical);
		var xauthed_services = xauth.getAvailableServices(cfg.s);
		var default_services = OPENLIKE.Verticals[cfg.vertical]? OPENLIKE.Verticals[cfg.vertical]: OPENLIKE.Verticals['default'];
		if (preferred_services.length) {
			build(preferred_services);
		}
		else if (xauthed_services.length) {
			xauth.checkServices(xauthed_services, function(verified_services) {
				if (verified_services.length) {
					build(verified_services);
				}
				else {
					build(default_services);
				}
			});
		}
		else {
			build(default_services);
		}
		
	}
	
	OPENLIKE.Widget = function(cfg) {
		
		// Get current script object
		var cfg = cfg? cfg: {};
		cfg.url = cfg.url? cfg.url: window.location.href;
		
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
		
		console.info('title', cfg.title);

		var script = document.getElementsByTagName('SCRIPT');
		script = script[script.length - 1];
		iframe = document.createElement('IFRAME');
		iframe.src = ('http://localhost/~justin/openlike/index.html?url=' + encodeURIComponent(cfg.url) + '&title=' + encodeURIComponent(cfg.title) + '&vertical=' + encodeURIComponent(cfg.vertical)); 
		var widget = document.getElementById('openlike-widget');
		console.log(script.parentNode);
		script.parentNode.insertBefore(iframe, wrapper);
		
	};

	OPENLIKE.prepSource = function(name, source) {
		source = OPENLIKE.util.update({}, source);
		source.name = name;
		source.target = OPENLIKE.util.notundef(source.target, '_blank');
		source.klass = 'openlike-' + OPENLIKE.util.escape(name);
		if (source.popup) {
			if (typeof(source.popup) != 'object') source.popup = {};
			source.popup.target = OPENLIKE.util.notundef(source.popup.target, '_blank');
			source.popup.attrs = OPENLIKE.util.notundef(source.popup.attrs, 'width=360,height=360');
		}
		return source;
	};
	
	OPENLIKE.Verticals = {
		
		'news': [
			'facebook',
			'twitter',
			'google',
			'yahoo',
			'reddit'
		],
		
		'movie': [
			'facebook',
			'twitter',
			'blockbuster',
			'netflix',
			//'getglue',
			'hunch'
		],
		
		'default': [
			'google',
			'facebook',
			'hunch',
			'digg',
			'reddit',
			'stumbleupon'
		]
		
	}

	// Sources that can be used out-of-box (in alphabetical order)
	// The OPENLIE.Sources object can be extended in a separate js file
	OPENLIKE.Sources = {
		digg: {
			url: 'http://digg.com/',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://digg.com/submit?phase=2&url=' + url + '&title=' + title;
			},
			title: 'Like this on Digg'
		},
		facebook: {
			/* TODO: add this back. doesn't work well w/ preference saving and editing
			html: function(cfg) {
				// <iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fdevelopers.facebook.com%2F&amp;layout=button_count&amp;show_faces=false&amp;width=25&amp;action=like&amp;colorscheme=light" scrolling="no" frameborder="0" allowTransparency="true" style="border:none; overflow:hidden; width:25px; height:px"></iframe>
				var elt = document.createElement('IFRAME'),
					width = 53;
				elt.src = 'http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(cfg.url) + '&amp;layout=button_count&amp;show_faces=false&amp;width=' + width + '&amp;action=like&amp;colorscheme=light';
				OPENLIKE.util.update(elt, {scrolling: 'no', frameBorder: '0', allowTransparency: 'true'});
				OPENLIKE.util.update(elt.style, {border: 'none', overflow: 'hidden', width: width+'px', height: '24px', padding: '1px 0 0 0'});
				//return elt;
				return false;
			},
			*/
			url: 'http://facebook.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://www.facebook.com/sharer.php?u=' + url + '&t=' + title;
			}
		},
		google: {
			url: 'http://google.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					msg = encodeURIComponent('I like this... ' + cfg.title);
					// add srcURL too?
				return 'http://www.google.com/buzz/post?message=' + msg + '&url=' + url;
			},
			title: 'Like this on Google Buzz',
			xauth: 'googxauthdemo.appspot.com'
		},
		hunch: {
			url: 'http://hunch.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title),
					category = cfg.type ? '&category=' + encodeURIComponent(cfg.type) : '';
				return 'http://hunch.com/openlike/?url=' + url + '&title=' + title + category;
			},
			/*
			popup: {
				target: '_blank',
				attrs: 'width=610,height=600'
			},
			*/
			title: 'Add this to your Hunch taste profile'
		},
		reddit: {
			url: 'http://reddit.com/',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://www.reddit.com/submit?url=' + url + '&title=' + title;
			},
			title: 'Like this on Reddit'
		},
		stumbleupon: {
			url: 'http://www.stumbleupon.com/',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url);
				return 'http://www.stumbleupon.com/submit?url=' + url;
			},
			title: 'Like this on StumbleUpon'
		},
		yahoo: {
			url: 'http://search.yahoo.com/',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://search.yahoo.com/search?p=' + title + '&fr=orion&ygmasrchbtn=Web+Search';
			},
			title: 'Search this on Yahoo Buzz!'
		},
		blockbuster: {
			url: 'http://www.blockbuster.com/',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.blockbuster.com/search/product/products?keyword=' + title;
			},
			title: 'Search this on Blockbuster'
		},
		netflix: {
			url: 'http://www.netflix.com/',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.netflix.com/WiSearch?oq=&v1=' + title + '&search_submit=';
			},
			title: 'Search this on Netflix'
		},
		twitter: {
			url: 'http://twitter.com',
			basicLink: function(a, cfg) {
				var msg = encodeURIComponent('I like this: ' + cfg.url + ' #openlike');
				return 'http://twitter.com/home?status=' + msg;
			},
			title: 'Tweet this like'
		}
	};
}