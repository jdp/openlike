OPENLIKE.Ui = new function() {
	
	this.toggleEditMode = function() {
		var widget = document.getElementById('openlike-widget');
		var button = document.getElementById('openlike-edit-btn');
		OPENLIKE.util.toggleClass(widget, 'edit');
		button.innerHTML = button.innerHTML == 'edit'? 'save': 'edit';
		OPENLIKE.Ui.updateServicePreferences();
	}

	/*
	 * Saves the user's preferences based on the states of the widget buttons.
	 */
	this.updateServicePreferences = function() {
		var widget = document.getElementById('openlike-widget');
		var edit_buttons = [];
		var vertical = widget.getAttribute('data-vertical');
		
		console.log('saving prefs for vertical', vertical);
		
		for (var i = 0; i < widget.childNodes[1].childNodes.length; i++) {
			edit_buttons.push(widget.childNodes[1].childNodes[i].childNodes[0]);
		}
		
		for (i = 0; i < edit_buttons.length; i++) {
			var button = edit_buttons[i];
			var enabled = button.className.match(/\benabled\b/) != null;
			OPENLIKE.Preferences[enabled? 'show': 'hide'](vertical, button.innerHTML.toLowerCase());
		}
		
	}
	
};

