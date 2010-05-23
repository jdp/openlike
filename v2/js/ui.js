OPENLIKE.Ui = new function() {
	
	this.s = {
		widget: '#openlike-widget',
		editBtns: '#openlike-widget.edit a',
		editModeBtn: '#openlike-edit-btn'
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
	$(OPENLIKE.Ui.s.editModeBtn)
		// show edit button
		.live('click', function() {
			var btn = $(this);
			$(OPENLIKE.Ui.s.widget).toggleClass('edit');
			btn.text(btn.text() == 'edit'? 'save': 'edit');
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