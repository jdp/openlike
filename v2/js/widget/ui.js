OPENLIKE.UI = new function() {
	
	/*
	 * Opens the preference editor pop up window.
	 */
	this.openEditor = function(vertical, share_url) {
		var win_features = OPENLIKE.Util.serialize({
			'width':      600,
			'height' :    300,
			'menubar':    'no',
			'location':   'no',
			'resizable':  'no',
			'scrollbars': 'no',
			'status':     'no'
		}, {separator: ','});
		var params = OPENLIKE.Util.serialize((function() {
			var params = {
				'vertical': vertical? vertical: 'news'
			};
			if (share_url) {
				params.share_url = share_url;
			}
			return params;
		})());
		var edit_win = window.open(OPENLIKE.assetHost+'/edit.html?'+params, 'OPENLIKE_Editor', win_features);
	}

	/*
	 * Saves the user's preferences based on the states of the widget buttons.
	 */
	this.updateServicePreferences = function() {
		var widget = document.getElementById('openlike-widget');
		var edit_items = [];
		var vertical = widget.getAttribute('data-vertical');
		
		for (var i = 0; i < widget.childNodes[1].childNodes.length; i++) {
			edit_items.push(widget.childNodes[1].childNodes[i]);
		}
		
		for (i = 0; i < edit_items.length; i++) {
			var item = edit_items[i];
			var enabled = OPENLIKE.Util.hasClass(item, 'enabled');
			OPENLIKE.Preferences[enabled? 'show': 'hide'](vertical, item.getAttribute('data-service'));
		}
		
	}
	
};

