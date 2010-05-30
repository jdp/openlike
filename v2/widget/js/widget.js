// TODO - add full support for the "open graph" meta elements
// TODO - add more specifics to each service, such as buzz "imageurl"

window['OPENLIKE'] = (function(ns) {
	
	ns.assetHost = document.location.href.match(/openlike.org/)?
	               'http://openlike.org':
	               document.location.href.match(/.*\/openlike/);

	/*
	 * Called on OpenLike's webspace, not seen by publishers or users.
	 * Builds an unordered list of OpenLike sources, and depending on context, can make them editable.
	 * @param Object cfg Configuration for the widget. Available properties:
	 * @option String header   the header text (or none) to give the widget (default 'Like this:')
	 * @option Array<String> s list of sites to share to (has a default)
	 * @option String css      the url for the css (optional, *only used in first ns.Widget call*)
	 * @option String url      the url of the object to like (default window.location.href)
	 * @option String title    the title of the object to like (default document.title)
	 * @option String type     the type of the object to like, e.g. product, activity, sport, bar, company (optional)
	 */
	ns.Widget = function(cfg) {

		var getParams = getGetParams();
		var vertical  = (getParams['vertical'] && (getParams['vertical'] != ''))? getParams['vertical']: 'news';
		var defaults  = {
				editable: false,
				url:      document.location.href,
				title:    document.title,
				vertical: 'news',
				header:   'OpenLike:',
				css:       ns.assetHost + '/v2/openlike.css',
				s:         ns.Verticals[vertical]
			},
			i, len, wrapper, title, list, li, a, source, css;

		// Merge defaults with get parameters, then merge that with configuration argument for final configuration
		cfg = ns.Util.update(defaults, getParams, cfg);
		
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
				return 'news';
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
		
		console.log('config:', cfg);

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
		 * @scope local
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
				title.innerHTML = ns.Util.escape(cfg.header);
				wrapper.appendChild(title);
			}

			// Build the list of services for the widget
			// All services are present in the list, but some are invisible if not enabled
			list = document.createElement('UL');
			for (i = 0, len = cfg.s.length; i < len; i++) {
				if (source = ns.Sources[cfg.s[i]]) {
					source = ns.prepSource(cfg.s[i], source);
					li = document.createElement('LI');
					// Some sources (Facebook Like :/) require custom HTML to work
					// Only show the custom HTML when not in edit mode
					if (source.html && !cfg.editable) {
						a = source.html(cfg);
					}
					else {
						a = document.createElement('A');
						ns.Util.addClass(a, source.klass);
						if (enabled_services.indexOf(source.name) > -1) {
							ns.Util.addClass(a, 'enabled');
						}
						a.setAttribute('data-service', source.name);
						a.href = '#';
						a.innerHTML = ns.Util.escape(source.name);
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
								if (ns.Preferences.isNewUser() && !cfg.editable) {
									ns.UI.openEditor(cfg.vertical, (e.srcElement || e.target).href);
									e.preventDefault();
									return false;
								}
								// If in edit mode, button clicks enable/disable sources
								if (ns.Util.hasClass(widget, 'edit') && cfg.editable) {
									// Toggle the button on the edit window
									ns.Util.toggleClass(this.parentNode, 'enabled');
									// Get the corresponding button on the content window and toggle it too
									var other_widget = window.opener.document.getElementById('openlike-widget');
									for (var i = 0; i < other_widget.childNodes[1].childNodes.length; i++) {
										var other_item = other_widget.childNodes[1].childNodes[i];
										if (other_item.getAttribute('data-service') == this.parentNode.getAttribute('data-service')) {
											ns.Util.toggleClass(other_item, 'enabled');
											ns.Util.toggleClass(other_item, 'limbo');
											window.opener.postMessage(JSON.stringify({
												'cmd': 'openlike::requestResize'
											}), ns.assetHost);
											break;
										}
									}
									// Re-enable the save button
									ns.Util.addClass(document.getElementById('openlike-save-btn'), 'enabled');
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
					ns.Util.addClass(li, source.klass);
					if (enabled_services.indexOf(source.name) > -1) {
						ns.Util.addClass(li, 'enabled');
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
				if (ns.Preferences.isNewUser()) {
					ns.Util.addClass(button, 'enabled');
				}
				button.onclick = (function(config) {
					return function() {
						if (ns.Util.hasClass(this, 'enabled')) {
							ns.UI.updateServicePreferences();
							ns.Util.removeClass(this, 'enabled');
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
						if (ns.Util.hasClass(other_item, 'limbo')) {
							ns.Util.toggleClass(other_item, 'enabled');
							ns.Util.removeClass(other_item, 'limbo');
							needs_resize = true;
						}
					}
					if (needs_resize) {
						window.opener.postMessage(JSON.stringify({
							'cmd': 'openlike::requestResize'
						}), ns.assetHost);
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
					ns.UI.openEditor(cfg.vertical);
					return false;
				}
				button.appendChild(document.createTextNode('edit'));
				wrapper.appendChild(button);
			}
		
			// More than one widget can be on the page, so a unique ID is assigned based on how many there are
			var widget_count = document.getElementsByClassName('openlike-widget').length;
			
			// Message listener should only be attached the first time the widget is added
			if (widget_count == 0) {
				// Receive messages from widgets messages
				function onMessage(event) {
					var msg = JSON.parse(event.data);
					var widget_iframe = event.source.frameElement;
					switch (msg['cmd']) {
						case 'openlike::ready':
							event.source.postMessage(JSON.stringify({
								'cmd': 'openlike::requestResize'
							}), event.origin);
							break;
						case 'openlike::resize': 
							widget_iframe.style.width = msg['width'] + 'px';
							break;
					}
					return false;
				}
				window.addEventListener('message', onMessage, false);
			}

			// Attach the widget to the page
			script.parentNode.insertBefore(wrapper, script);
		
			wrapper = title = list = li = script = source = null;
		}

		// Determine, of the defaults, which to use
		// in this order: preferred, xauthed, viewed, default
		var preferred_services = ns.Preferences.get(cfg.vertical);
		var default_services = (ns.Verticals[cfg.vertical]? ns.Verticals[cfg.vertical]: ns.Verticals['news']).slice(0, 3);
		build(preferred_services.length? preferred_services: default_services);

	};

	ns.prepSource = function(name, source) {
		source = ns.Util.update({}, source);
		source.name = name;
		source.target = ns.Util.notundef(source.target, '_blank');
		source.klass = 'openlike-' + ns.Util.escape(name);
		if (source.popup) {
			if (typeof(source.popup) != 'object') source.popup = {};
			source.popup.target = ns.Util.notundef(source.popup.target, '_blank');
			source.popup.attrs = ns.Util.notundef(source.popup.attrs, 'width=360,height=360');
		}
		return source;
	};
	
	return ns;

})(OPENLIKE || {});
