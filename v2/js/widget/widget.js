// TODO - add full support for the "open graph" meta elements
// TODO - add more specifics to each service, such as buzz "imageurl"

var OPENLIKE = {
	assetHost: document.location.href.match(/openlike.org/)? 'http://openlike.org': document.location.href.match(/.*\/openlike/)
}

/*
 * Called on OpenLike's webspace, not seen by publishers or users.
 * Builds an unordered list of OpenLike sources, and depending on context, can make them editable.
 * @param Object cfg Configuration for the widget. Available properties:
 * @option String header   the header text (or none) to give the widget (default 'Like this:')
 * @option Array<String> s list of sites to share to (has a default)
 * @option String css      the url for the css (optional, *only used in first OPENLIKE.Widget call*)
 * @option String url      the url of the object to like (default window.location.href)
 * @option String title    the title of the object to like (default document.title)
 * @option String type     the type of the object to like, e.g. product, activity, sport, bar, company (optional)
 */
OPENLIKE.buildWidget = function(cfg) {

	var getParams = getGetParams();
	var vertical  = (getParams['vertical'] && (getParams['vertical'] != ''))? getParams['vertical']: 'news';
	var defaults  = {
			editable: false,
			url:      document.location.href,
			title:    document.title,
			vertical: 'news',
			header:   'OpenLike:',
			css:       OPENLIKE.assetHost + '/v2/css/openlike.css',
			s:         (function() {
			         		return OPENLIKE.Verticals[vertical];
			           })()
		},
		i, len, wrapper, title, list, li, a, source, css;

	// Merge defaults with get parameters, then merge that with configuration argument for final configuration
	cfg = OPENLIKE.Util.update(defaults, getParams, cfg);

	// Returns an object representation of the GET parameters
	function getGetParams() {
	    var vars = {}, hash;
		if (window.location.href.indexOf('?') == -1) {
			return vars;
		}
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++) {
	        hash = hashes[i].split('=');
	        vars[hash[0]] = decodeURIComponent(hash[1]);
	    }
	    return vars;
	}

	/*
	 * Callback to build the widget.
	 * Called after vertical has been identified and appropriate sources selected.
	 * @scope local OPENLIKE.buildWidget
	 * @param Array<String> enabled_services Services that are enabled and available in the widget
	 */
	function build(enabled_services) {
	
		// Add CSS
		if (cfg.css) {
			css = document.createElement('LINK');
			css.rel = 'stylesheet';
			css.type = 'text/css';
			css.href = cfg.css;
			(document.getElementsByTagName('HEAD')[0] || document.body).appendChild(css);
		}

		// Get current script object, so that the script can intelligently insert itself
		var script = document.getElementsByTagName('SCRIPT');
		script = script[script.length - 1];

		// Build the widget container
		wrapper = document.createElement('DIV');
		wrapper.id = 'openlike-widget';
		wrapper.className = cfg.editable? 'openlike clearfix edit': 'openlike clearfix';
		wrapper.style.backgroundColor = 'transparent';
		wrapper.setAttribute('data-vertical', cfg.vertical)
		if (cfg.header) {
			title = document.createElement('P');
			title.innerHTML = OPENLIKE.Util.escape(cfg.header);
			wrapper.appendChild(title);
		}

		// Build the list of services for the widget
		// All services are present in the list, but some are invisible if not enabled
		list = document.createElement('UL');
		for (i = 0, len = cfg.s.length; i < len; i++) {
			if (source = OPENLIKE.Sources[cfg.s[i]]) {
				source = OPENLIKE.prepSource(cfg.s[i], source);
				li = document.createElement('LI');
				// Some sources (Facebook Like :/) require custom HTML to work
				// Only show the custom HTML when not in edit mode
				if (source.html && !cfg.editable) {
					a = source.html(cfg);
				}
				else {
					a = document.createElement('A');
					OPENLIKE.Util.addClass(a, source.klass);
					if (enabled_services.indexOf(source.name) > -1) {
						OPENLIKE.Util.addClass(a, 'enabled');
					}
					a.setAttribute('data-service', source.name);
					a.href = '#';
					a.innerHTML = OPENLIKE.Util.escape(source.name);
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
							// If no preferences are available and not in edit mode already, ENGAGE EDIT MODE
							if (OPENLIKE.Preferences.isNewUser() && !cfg.editable) {
								OPENLIKE.UI.openEditor(cfg.vertical, (e.srcElement || e.target).href);
								e.preventDefault();
								return false;
							}
							// If in edit mode, button clicks enable/disable sources
							if (OPENLIKE.Util.hasClass(widget, 'edit') && cfg.editable) {
								// Toggle the button on the edit window
								OPENLIKE.Util.toggleClass(this.parentNode, 'enabled');
								// Get the corresponding button on the content window and toggle it too
								var other_widget = window.opener.document.getElementById('openlike-widget');
								for (var i = 0; i < other_widget.childNodes[1].childNodes.length; i++) {
									var other_item = other_widget.childNodes[1].childNodes[i];
									if (other_item.getAttribute('data-service') == this.parentNode.getAttribute('data-service')) {
										OPENLIKE.Util.toggleClass(other_item, 'enabled');
										OPENLIKE.Util.toggleClass(other_item, 'limbo');
										window.opener.postMessage(JSON.stringify({
											'cmd': 'openlike::requestResize'
										}), OPENLIKE.assetHost);
										break;
									}
								}
								// Re-enable the save button
								OPENLIKE.Util.addClass(document.getElementById('openlike-save-btn'), 'enabled');
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
							return true;
						};
					})(source);
				}
				OPENLIKE.Util.addClass(li, source.klass);
				if (enabled_services.indexOf(source.name) > -1) {
					OPENLIKE.Util.addClass(li, 'enabled');
				}
				li.setAttribute('data-service', source.name);
				li.appendChild(a);
				list.appendChild(li);
			}
		}
		wrapper.appendChild(list);

		// Append either edit or save button to widget depending on mode
		var button = document.createElement('a');
		if (cfg.editable) {
			// Append the save button if EDIT MODE ENGAGED
			button.id = 'openlike-save-btn';
			if (OPENLIKE.Preferences.isNewUser()) {
				OPENLIKE.Util.addClass(button, 'enabled');
			}
			button.onclick = (function(config) {
				return function() {
					if (OPENLIKE.Util.hasClass(this, 'enabled')) {
						OPENLIKE.UI.updateServicePreferences();
						OPENLIKE.Util.removeClass(this, 'enabled');
					}
					if (config.share_url) {
						window.opener.open(config.share_url, '_blank');
					}
					window.close();
				}
			})(cfg);
			window.onunload = function(event) {
				var other_widget = window.opener.document.getElementById('openlike-widget');
				var needs_resize = false;
				for (var i = 0; i < other_widget.childNodes[1].childNodes.length; i++) {
					var other_item = other_widget.childNodes[1].childNodes[i];
					if (OPENLIKE.Util.hasClass(other_item, 'limbo')) {
						OPENLIKE.Util.toggleClass(other_item, 'enabled');
						OPENLIKE.Util.removeClass(other_item, 'limbo');
						needs_resize = true;
					}
				}
				if (needs_resize) {
					window.opener.postMessage(JSON.stringify({
						'cmd': 'openlike::requestResize'
					}), OPENLIKE.assetHost);
				}
			}
			var button_text = 'Save '+cfg.vertical+' Preferences and '+(cfg.share_url? 'Share': 'Close');
			button.appendChild(document.createTextNode(button_text));
			script.parentNode.insertBefore(button, script.nextSibling);
		}
		else {
			// Otherwise, show the edit button
			button.id = 'openlike-edit-btn';
			button.href = '#';
			button.onclick = function(e) {
				OPENLIKE.UI.openEditor(cfg.vertical);
				return false;
			}
			button.appendChild(document.createTextNode('edit'));
			wrapper.appendChild(button);
		}
		
		// Attach a message event listener
		function onMessage(event) {
			var msg = JSON.parse(event.data);
			if (msg['cmd']) {
				switch (msg['cmd']) {
					case 'openlike::requestResize':
						window.parent.postMessage(JSON.stringify({
							'cmd': 'openlike::resize',
							'width': getWrapperWidth()
						}), '*');
						break;
				}
			}
		}
		
		window.addEventListener('message', onMessage, false);

		// Attach the widget to the page
		script.parentNode.insertBefore(wrapper, script);
		
		// Let parent window know widget is built
		window.parent.postMessage(JSON.stringify({
			'cmd': 'openlike::ready'
		}), '*');
		
		/*
		 * Returns the width of the widget wrapper in pixels.
		 * @access local to OPENLIKE.buildWidget
		 * @return Integer width of the widget in pixels
		 * @todo Use less naive approach
		 */
		function getWrapperWidth() {
			var wrapper = document.getElementById('openlike-widget');
			// Resize the iframe
			var widget_width = 0;
			// the header text
			var p_width = wrapper.childNodes[0].offsetWidth + 5;
			// the service icon list
			var ul_width = 0;
			var li_nodes = wrapper.childNodes[1].childNodes;
			for (i = 0; i < li_nodes.length; i++) {
				if (OPENLIKE.Util.hasClass(li_nodes[i], 'enabled')) {
					ul_width += 31;
					if (OPENLIKE.Util.hasClass(li_nodes[i], 'openlike-facebook')) {
						ul_width += 28;
					}
				}
			}
			// the edit button
			var a_width = wrapper.childNodes[2].offsetWidth + 5;
			// size up widget
			return (widget_width = p_width + ul_width + a_width + 15);
		}
		
		wrapper = title = list = li = script = source = null;
	}

	// Determine, of the defaults, which to use
	// in this order: preferred, xauthed, viewed, default
	var preferred_services = OPENLIKE.Preferences.get(cfg.vertical);
	var xauthed_services = OPENLIKE.XAuthHelper.getAvailableServices(cfg.s);
	var default_services = (OPENLIKE.Verticals[cfg.vertical]? OPENLIKE.Verticals[cfg.vertical]: OPENLIKE.Verticals['news']).slice(0, 3);
	if (preferred_services.length) {
		build(preferred_services);
	}
	else if (xauthed_services.length) {
		OPENLIKE.XAuthHelper.checkServices(xauthed_services, function(verified_services) {
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

};

OPENLIKE.prepSource = function(name, source) {
	source = OPENLIKE.Util.update({}, source);
	source.name = name;
	source.target = OPENLIKE.Util.notundef(source.target, '_blank');
	source.klass = 'openlike-' + OPENLIKE.Util.escape(name);
	if (source.popup) {
		if (typeof(source.popup) != 'object') source.popup = {};
		source.popup.target = OPENLIKE.Util.notundef(source.popup.target, '_blank');
		source.popup.attrs = OPENLIKE.Util.notundef(source.popup.attrs, 'width=360,height=360');
	}
	return source;
};

OPENLIKE.Verticals = {

	'news': [
		'facebook',
		'twitter',
		'digg',
		'google',
		'yahoo',
		'reddit'
	],

	'movie': [
		'facebook',
		'twitter',
		'blockbuster',
		'netflix',
		'getglue',
		'imdb',
		'flixster',
		'amazon',
		'hunch'
	],

	'book': [
		'amazon',
		'goodreads',
		'shelfari',
		'librarything',
		'weread',
		'getglue',
		'hunch'
	],

	'music': [
		'lastfm',
		'pandora',
		'getglue',
		'hunch'
	],

	'video_game': [
		'gamespot',
		'getglue',
		'hunch'
	],

	'tv_show': [
		'imdb',
		'getglue',
		'hunch'
	]

};

/*
 * Sources that can be used out-of-box (in alphabetical order)
 * The OPENLIKE.Sources object can be extended in a separate js file
 */
OPENLIKE.Sources = {
	'digg': {
		url: 'http://digg.com/',
		basicLink: function(a, cfg) {
			var url = encodeURIComponent(cfg.url),
				title = encodeURIComponent(cfg.title);
			return 'http://digg.com/submit?phase=2&url=' + url + '&title=' + title;
		},
		title: 'Like this on Digg'
	},
	'facebook': {
		html: function(cfg) {
			// <iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fdevelopers.facebook.com%2F&amp;layout=button_count&amp;show_faces=false&amp;width=25&amp;action=like&amp;colorscheme=light" scrolling="no" frameborder="0" allowTransparency="true" style="border:none; overflow:hidden; width:25px; height:px"></iframe>
			var elt = document.createElement('IFRAME'),
				width = 53;
			elt.onclick = function(e) {
				alert('clicked');
			};
			elt.src = 'http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(cfg.url) + '&amp;layout=button_count&amp;show_faces=false&amp;width=' + width + '&amp;action=like&amp;colorscheme=light';
			OPENLIKE.Util.update(elt, {scrolling: 'no', frameBorder: '0', allowTransparency: 'true'});
			OPENLIKE.Util.update(elt.style, {border: 'none', overflow: 'hidden', width: width+'px', height: '24px', padding: '1px 0 0 0'});
			return elt;
		},
		url: 'http://facebook.com',
		basicLink: function(a, cfg) {
			var url = encodeURIComponent(cfg.url),
				title = encodeURIComponent(cfg.title);
			return 'http://www.facebook.com/sharer.php?u=' + url + '&t=' + title;
		}
	},
	'google': {
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
	'hunch': {
		url: 'http://hunch.com',
		basicLink: function(a, cfg) {
			var url = encodeURIComponent(cfg.url),
				title = encodeURIComponent(cfg.title),
				category = cfg.type ? '&category=' + encodeURIComponent(cfg.type) : '';
			return 'http://hunch.com/openlike/?url=' + url + '&title=' + title + category;
		},
		popup: {
			target: '_blank',
			attrs: 'width=610,height=600'
		},
		title: 'Add this to your Hunch taste profile'
	},
	'reddit': {
		url: 'http://reddit.com/',
		basicLink: function(a, cfg) {
			var url = encodeURIComponent(cfg.url),
				title = encodeURIComponent(cfg.title);
			return 'http://www.reddit.com/submit?url=' + url + '&title=' + title;
		},
		title: 'Like this on Reddit'
	},
	'stumbleupon': {
		url: 'http://www.stumbleupon.com/',
		basicLink: function(a, cfg) {
			var url = encodeURIComponent(cfg.url);
			return 'http://www.stumbleupon.com/submit?url=' + url;
		},
		title: 'Like this on StumbleUpon'
	},
	'yahoo': {
		url: 'http://search.yahoo.com/',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://search.yahoo.com/search?p=' + title + '&fr=orion&ygmasrchbtn=Web+Search';
		},
		title: 'Search this on Yahoo Buzz!'
	},
	'blockbuster': {
		url: 'http://www.blockbuster.com/',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://www.blockbuster.com/search/product/products?keyword=' + title;
		},
		title: 'Search this on Blockbuster'
	},
	'netflix': {
		url: 'http://www.netflix.com/',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://www.netflix.com/WiSearch?oq=&v1=' + title + '&search_submit=';
		},
		title: 'Search this on Netflix'
	},
	'twitter': {
		url: 'http://twitter.com',
		basicLink: function(a, cfg) {
			var msg = encodeURIComponent('I like this: ' + cfg.url + ' #openlike');
			return 'http://twitter.com/home?status=' + msg;
		},
		title: 'Tweet this like'
	},
	'flixster': {
		url: 'http://flixster.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://flixster.com/search?q=' + title;
		},
		title: 'Search this on Flixster'
	},
	'imdb': {
		url: 'http://imdb.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://www.imdb.com/find?s=tt&q=' + title;
		},
		title: 'Search this on IMDb'
	},
	'amazon': {
		url: 'http://amazon.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			var alias = (function() {
				switch (cfg.vertical) {
					case 'movie':
					case 'tv_show':
						return 'dvd';
					default:
						return 'aps';
				}
			})();
			return 'http://www.amazon.com/s/ref=openlike?url=search-alias%3D'+alias+'&field-keywords='+title+'&x=0&y=0';
		},
		title: 'Search this on Amazon'
	},
	'getglue': {
		url: 'http://getglue.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://getglue.com/search?q=' + title;
		},
		title: 'Search this on GetGlue'
	},
	'goodreads': {
		url: 'http://goodreads.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://www.goodreads.com/search/search?search_type=books&search[query]=' + title;
		},
		title: 'Search this on GoodReads'
	},
	'shelfari': {
		url: 'http://shelfari.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://www.shelfari.com/search/books?Keywords=' + title;
		},
		title: 'Search this on Shelfari'
	},
	'librarything': {
		url: 'http://librarything.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://www.librarything.com/search_works.php?q=' + title;
		},
		title: 'Search this on LibraryThing'
	},
	'weread': {
		url: 'http://weread.com',
		basicLink: function(a, cfg) {
			var title = encodeURIComponent(cfg.title);
			return 'http://weread.com/search/book/' + title;
		},
		title: 'Search this on WeRead'
	}
};
