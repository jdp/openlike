OPENLIKE.Preferences = new function() {
	
	this.getStorage = function() {
		return localStorage.openlike? JSON.parse(localStorage.openlike): {};
	};
	
	/*
	 * Returns an array of services that are authenticated for
	 * a given vertical.
	 * @param String vertical The vertical to check for authed services
	 * @return Array<String> Array of services
	 */
	this.get = function(vertical) {
		var storage = OPENLIKE.Preferences.getStorage();
		console.log('get', vertical, 'storage', storage);
		return storage[vertical]? storage[vertical]: [];
	};
	
	/*
	 * Actually performs writes to client-side storage.
	 * @param String vertical The vertical to save to
	 * @param Array<String> services The services to save to the vertical
	 * @return Boolean
	 */
	this.put = function(vertical, services) {
		var storage = OPENLIKE.Preferences.getStorage();
		console.log('put', services, 'in', vertical, 'storage', storage);
		storage[vertical] = services;
		localStorage.openlike = JSON.stringify(storage);
		return true;
	};
	
	/*
	 * Shows a service in the given vertical.
	 * @param String vertical The vertical the service is being added to
	 * @param String service The service to add to the vertical
	 * @return Boolean Whether or not the service was added to the vertical
	 */
	this.show = function(vertical, service) {
		var stored = OPENLIKE.Preferences.get(vertical);
		if (stored.indexOf(service) == -1) {
			stored.push(service);
			return OPENLIKE.Preferences.put(vertical, stored);
		}
		return false;
	};
	
	/*
	 * Hides a service from the given vertical.
	 * @param String vertical The vertical the service is being removed from
	 * @param String service The service to remove from the vertical
	 * @return Boolean Whether or not the service was removed from the vertical
	 */
	this.hide = function(vertical, service) {
		var stored = OPENLIKE.Preferences.get(vertical),
		    index;
		if ((index = stored.indexOf(service)) > -1) {
			stored.splice(index, 1);
			return OPENLIKE.Preferences.put(vertical, stored);
		}
		return false;
	};

}
