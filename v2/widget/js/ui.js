var OPENLIKE = (function(ns) {
	
	ns.UI = new function() {
	
		/*
		 * Opens the preference editor pop up window.
		 */
		this.openEditor = function(widget_id, vertical, share_url) {
			var win_features = ns.Util.serialize({
				'width':      600,
				'height' :    300,
				'menubar':    'no',
				'location':   'no',
				'resizable':  'no',
				'scrollbars': 'no',
				'status':     'no'
			}, {separator: ','});
			var params = ns.Util.serialize((function() {
				var params = {
					'vertical': vertical? vertical: 'news',
					'widget_id': widget_id
				};
				if (share_url) {
					params['share_url'] = share_url;
				}
				return params;
			})());
			var edit_win = window.open(ns.assetHost+'/edit.html?'+params, 'OPENLIKE_Editor', win_features);
		}
		
		this.getServiceItems = function(widget) {
			var lis = widget.getElementsByTagName('li');
			var items = [];
			for (var i = 0; i < lis.length; i++) {
				if (lis[i].hasAttribute('data-service')) {
					items.push(lis[i]);
				}
			}
			return items;
		}
		
		this.getEnabledServices = function(widget) {
			var lis = widget.getElementsByTagName('li');
			var items = [];
			for (var i = 0; i < lis.length; i++) {
				if (lis[i].hasAttribute('data-service') && ns.Util.hasClass(lis[i], 'enabled')) {
					items.push(lis[i]);
				}
			}
			return items;
		}
		
		/**
		 * Enables services in the widget.
		 * @param {object} widget DOM node of the widget to update
		 * @param {Array} services Array of service names to enable
		 */
		this.enableServices = function(widget, services) {
			var items = this.getServiceItems(widget);
			console.log('enabling services', services, 'for', widget);
			for (var i = 0; i < items.length; i++) {
				if (services.indexOf(items[i].getAttribute('data-service')) > -1) {
					ns.Util.addClass(items[i], 'enabled');
				}
				else {
					ns.Util.removeClass(items[i], 'enabled');
				}
			}
		}

		/*
		 * Saves the user's preferences based on the states of the widget buttons.
		 * This is only called while in edit mode, on OpenLike webspace.
		 */
		this.updateServicePreferences = function() {
			// This is always called on edit.html, so edit widget is always openlike-widget-1
			var widget = document.getElementById('openlike-widget-1');
			var edit_items = [];
			var enabled_services = [];
			var vertical = widget.getAttribute('data-vertical');
		
			for (var i = 0; i < widget.childNodes[1].childNodes.length; i++) {
				edit_items.push(widget.childNodes[1].childNodes[i]);
			}
		
			for (i = 0; i < edit_items.length; i++) {
				var item = edit_items[i];
				var enabled = OPENLIKE.Util.hasClass(item, 'enabled');
				if (enabled) {
					enabled_services.push(item.getAttribute('data-service'));
				}
				ns.Preferences[enabled? 'show': 'hide'](vertical, item.getAttribute('data-service'));
			}
			
			window.opener.postMessage(JSON.stringify({
				'cmd': 'openlike::services',
				'services': enabled_services,
				'widget-id': document.getElementById('openlike-save-btn').getAttribute('data-widget-id')
			}), window.opener.location.href);
		
		}
	
	};
	
	return ns;
	
})(OPENLIKE || {});
