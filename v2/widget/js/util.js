var OPENLIKE = (function(ns) {
	
	ns.Util = {
	
		update: function() {
			var obj = arguments[0], i = 1, len=arguments.length, attr;
			for (; i < len; i++) {
				for (attr in arguments[i]) {
					if (arguments[i].hasOwnProperty(attr)) {
						obj[attr] = arguments[i][attr];
					}
				}
			}
			return obj;
		},
	
		escape: function(s) {
			return ((s == null) ? '' : s).toString().replace(/[<>"&\\]/g, function(s) {
				switch(s) {
					case '<': return '&lt;';
					case '>': return '&gt;';
					case '"': return '\"';
					case '&': return '&amp;';
					case '\\': return '\\\\';
					default: return s;
				}
			});
		},
	
		notundef: function(a, b) {
			return typeof(a) == 'undefined' ? b : a;
		},
	
		hasClass: function(el, klass) {
			var regexpr = new RegExp('\\b'+klass+'\\b');
			return el.className.match(regexpr)? true: false;
		},
	
		addClass: function(el, klass) {
			if (ns.Util.hasClass(el, klass)) {
				return false;
			}
			el.className += ' ' + klass;
			return true;
		},
	
		removeClass: function(el, klass) {
			if (!ns.Util.hasClass(el, klass)) {
				return false;
			}
			el.className = el.className.replace(new RegExp('\\b'+klass+'\\b'), '');
			return true;
		},
	
		toggleClass: function(el, klass) {
			return ns.Util.hasClass(el, klass)? ns.Util.removeClass(el, klass): ns.Util.addClass(el, klass);
		},
	
		serialize: function(obj, options) {
			var defaults = {
				separator: '&',
				join: '=',
				urlencode: true
			};
			var pairs = [];
			var options = ns.Util.update(defaults, options? options: {});
			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					var key = options.urlencode? encodeURIComponent(prop): prop;
					var value = options.urlencode? encodeURIComponent(obj[prop]): obj[prop];
					pairs.push(key+options.join+value);
				}
			}
			return pairs.join(options.separator);
		}
	
	};
	
	return ns;
	
})(OPENLIKE||{});
