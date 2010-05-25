OPENLIKE.UI = new function() {
	
	/*
	 * Opens the preference editor pop up window.
	 */
	this.openEditor = function(vertical) {
		var win_features = "width=600,height=300,menubar=no,location=no,resizable=no,scrollbars=no,status=no";
		var edit_win = window.open(OPENLIKE.assetHost+'/edit.html?vertical='+encodeURIComponent(vertical), 'OPENLIKE_Editor', win_features);
	}

	/*
	 * Saves the user's preferences based on the states of the widget buttons.
	 */
	this.updateServicePreferences = function() {
		var widget = document.getElementById('openlike-widget');
		var edit_buttons = [];
		var vertical = widget.getAttribute('data-vertical');
		
		for (var i = 0; i < widget.childNodes[1].childNodes.length; i++) {
			edit_buttons.push(widget.childNodes[1].childNodes[i].childNodes[0]);
		}
		
		for (i = 0; i < edit_buttons.length; i++) {
			var button = edit_buttons[i];
			var enabled = OPENLIKE.util.hasClass(button, 'enabled');
			OPENLIKE.Preferences[enabled? 'show': 'hide'](vertical, button.getAttribute('data-service'));
		}
		
	}
	
};

