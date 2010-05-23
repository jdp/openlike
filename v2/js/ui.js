OPENLIKE.Ui = new function() {
	
	this.s = {
		widget: '#openlike-widget',
		editBtns: '#openlike-widget.edit a'
	}

	this.updateServicePreferences = function() {
		
		var vertical = $(OPENLIKE.Ui.s.widget).attr('data-vertical');
				
		$(OPENLIKE.Ui.s.editBtns).each(function() {
			var btn = $(this),
				enabled = btn.hasClass('enabled');
		 	OPENLIKE.Preferences[enabled? 'show': 'hide'](vertical, btn.text().toLowerCase());
		});
		
	}
	
};

$(function() {
	
	// widget body
	$(OPENLIKE.Ui.s.widget)
		// show edit button
		.live('dblclick', function() {
			$(this).toggleClass('edit');
		});
		
	// widget body
	$(OPENLIKE.Ui.s.editBtns)
		// show edit button
		.live('click', function(e) {
			$(this).toggleClass('enabled');
			OPENLIKE.Ui.updateServicePreferences();
			e.preventDefault();
		});
	
});