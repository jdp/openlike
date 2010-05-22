$(function() {
	
	var s = {
		widget: '#openlike-widget',
		editBtn: 'a.edit',
		editPanel: '#openlike-edit',
		editBody: '#openlike-edit-contents'
	}
	
	// widget body
	$(s.widget)
		// show edit button
		.live('mouseenter', function() {
			$(s.editBtn, $(s.widget)).fadeIn();
		})
		// hide edit button
		.live('mouseleave', function() {
			$(s.editBtn, $(s.widget)).fadeOut();
		});
	
	// edit button
	$(s.editBtn, $(s.widget))
		// show edit panel
		.live('click', function() {
			var widget = $(this).closest(s.widget),
				editPanel = $(s.editPanel),
				serviceNodes = $('li', widget).clone();
			// if panel doesnt exist yet we need to build it
			if(!editPanel.size()) {
				editPanel = $('<div id="openlike-edit">Edit Openlike<ul id="openlike-edit-contents"></ul></div>');
				$('body').append(editPanel);
			}
			// take the buttons from widget and put them in the panel
			$(s.editBody).empty().append(serviceNodes);
			// show panel
			editPanel.show();
		});
	
});