OPENLIKE.Ui = new function() {

	this.updateServicePreferences = function(serviceList, btn) {
		
			// toggle button in menu
		var btn = btn.toggleClass('enabled'),
			// current clicked service name
			service = btn.text().toLowerCase(),
			// find the associated button in the widget (needs to be in sync)
			widgetBtn = $('a.openlike-' + service, serviceList.data('widget')).toggleClass('enabled'),
			// vertical name
			vertical = serviceList.attr('data-vertical');
		// update the preference for each item in the edit list
		// (the whole array gets updated)
		$('a', serviceList).each(function() {
			var btn = $(this),
				enabled = btn.hasClass('enabled');
			// save the preference for this particular service in this vertical
			try { 
				OPENLIKE.Preferences[enabled? 'show': 'hide'](vertical, btn.text().toLowerCase());
			} catch(e) { alert(e); }
		});
		
	}
	
};

$(function() { 
	
	var s = {
		widget: '#openlike-widget',
		editPanel: '#openlike-edit',
		editBody: '#openlike-edit-contents'
	}
	
	// widget body
	$(s.widget)
		// show edit button
		.live('dblclick', function() {
			var widget = $(this).closest(s.widget),
				editPanel = $(s.editPanel),
				serviceNodes = $('li', widget).clone();
			// if panel doesnt exist yet we need to build it
			if(!editPanel.size()) {
				editPanel = $('<div id="openlike-edit" class="openlike"><span>Edit Openlike</span><ul id="openlike-edit-contents"></ul></div>');
				$('body').append(editPanel);
			}
			// take the buttons from widget and put them in the panel
			$(s.editBody).empty()
				.append(serviceNodes)
				.attr('data-vertical', widget.attr('data-vertical'))
				.data('widget', widget);
			// show panel
			editPanel.show();
		});
		
	// hedit panel
	$(s.editPanel)
		// hide edit panel
		.live('mouseleave', function() {
			$(this).fadeOut();
		});	
		
	// buttons in the edit panel that turn them on/off
	$([s.editBody, 'a'].join(' '))
		// change button enabled
		.live('click', function(e) {
				// toggle current button state
			var btn = $(this),
				// the list with the services
				editList = btn.closest(s.editBody);
			// this goes through each service in the list
			// and changes its preference accordingly
			OPENLIKE.Ui.updateServicePreferences(editList, btn);
			// don't gooo
			e.preventDefault();
		});
	
});