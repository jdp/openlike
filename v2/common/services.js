var OPENLIKE = (function(ns) {
	
	/*
	 * Different verticals are made of different sources.
	 * Should be organized by relevance, because if the user has no saved
	 *   preferences, only the first few will be shown.
	 */
	ns.Verticals = {

		'news': [
			'facebook',
			'twitter',
			'digg',
			'myspace',
			'google',
			'yahoo',
			'reddit'
		],

		'movie': [
			'facebook',
			'twitter',
			'blockbuster',
			'netflix',
			'getglue',
			'imdb',
			'flixster',
			'amazon',
			'hunch',
			'myspace'
		],

		'book': [
			'facebook',
			'twitter',
			'amazon',
			'goodreads',
			'shelfari',
			'librarything',
			'weread',
			'getglue',
			'hunch'
		],

		'music': [
			'facebook',
			'twitter',
			'lastfm',
			'pandora',
			'getglue',
			'hunch'
		],

		'video_game': [
			'facebook',
			'twitter',
			'gamespot',
			'getglue',
			'hunch'
		],

		'tv_show': [
			'facebook',
			'twitter',
			'imdb',
			'getglue',
			'hunch'
		]

	};

	/*
	 * Sources that can be used out-of-box (in alphabetical order)
	 * The OPENLIKE.Sources object can be extended in a separate js file
	 */
	ns.Sources = {
		
		'digg': {
			url: 'http://digg.com/',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://digg.com/submit?phase=2&url=' + url + '&title=' + title;
			},
			title: 'Like this on Digg'
		},
		
		'facebook': {
			html: function(cfg) {
				// <iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fdevelopers.facebook.com%2F&amp;layout=button_count&amp;show_faces=false&amp;width=25&amp;action=like&amp;colorscheme=light" scrolling="no" frameborder="0" allowTransparency="true" style="border:none; overflow:hidden; width:25px; height:px"></iframe>
				var elt = document.createElement('IFRAME'),
					width = 53;
				elt.onclick = function(e) {
					alert('clicked');
				};
				elt.src = 'http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(cfg.url) + '&amp;layout=button_count&amp;show_faces=false&amp;width=' + width + '&amp;action=like&amp;colorscheme=light';
				OPENLIKE.Util.update(elt, {scrolling: 'no', frameBorder: '0', allowTransparency: 'true'});
				OPENLIKE.Util.update(elt.style, {border: 'none', overflow: 'hidden', width: width+'px', height: '24px', padding: '1px 0 0 0'});
				return elt;
			},
			url: 'http://facebook.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://www.facebook.com/sharer.php?u=' + url + '&t=' + title;
			}
		},
		
		'google': {
			url: 'http://google.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					msg = encodeURIComponent('I like this... ' + cfg.title);
					// add srcURL too?
				return 'http://www.google.com/buzz/post?message=' + msg + '&url=' + url;
			},
			title: 'Like this on Google Buzz',
			xauth: 'googxauthdemo.appspot.com'
		},
		
		'hunch': {
			url: 'http://hunch.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title),
					category = cfg.type ? '&category=' + encodeURIComponent(cfg.type) : '';
				return 'http://hunch.com/openlike/?url=' + url + '&title=' + title + category;
			},
			popup: {
				target: '_blank',
				attrs: 'width=610,height=600'
			},
			title: 'Add this to your Hunch taste profile'
		},
		
		'myspace': {
			url: 'http://myspace.com',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://www.myspace.com/Modules/PostTo/Pages/?u=' + url + '&t=' + title;
			},
			popup: {
				target: '_blank',
				attrs: 'width=450,height=440'
			},
			title: 'Like this on MySpace'
		},
		
		'reddit': {
			url: 'http://reddit.com/',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url),
					title = encodeURIComponent(cfg.title);
				return 'http://www.reddit.com/submit?url=' + url + '&title=' + title;
			},
			title: 'Like this on Reddit'
		},
		
		'stumbleupon': {
			url: 'http://www.stumbleupon.com/',
			basicLink: function(a, cfg) {
				var url = encodeURIComponent(cfg.url);
				return 'http://www.stumbleupon.com/submit?url=' + url;
			},
			title: 'Like this on StumbleUpon'
		},
		
		'yahoo': {
			url: 'http://search.yahoo.com/',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://search.yahoo.com/search?p=' + title + '&fr=orion&ygmasrchbtn=Web+Search';
			},
			title: 'Like this on Yahoo Buzz!'
		},
		
		'blockbuster': {
			url: 'http://www.blockbuster.com/',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.blockbuster.com/search/product/products?keyword=' + title;
			},
			title: 'Search this on Blockbuster'
		},
		
		'netflix': {
			url: 'http://www.netflix.com/',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.netflix.com/WiSearch?oq=&v1=' + title + '&search_submit=';
			},
			title: 'Search this on Netflix'
		},
		
		'twitter': {
			url: 'http://twitter.com',
			basicLink: function(a, cfg) {
				var msg = encodeURIComponent('I like this: ' + cfg.url + ' #openlike');
				return 'http://twitter.com/home?status=' + msg;
			},
			title: 'Tweet this like'
		},
		
		'flixster': {
			url: 'http://flixster.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://flixster.com/search?q=' + title;
			},
			title: 'Search this on Flixster'
		},
		
		'imdb': {
			url: 'http://imdb.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.imdb.com/find?s=tt&q=' + title;
			},
			title: 'Search this on IMDb'
		},
		
		'amazon': {
			url: 'http://amazon.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				var alias = (function() {
					switch (cfg.vertical) {
						case 'movie':
						case 'tv_show':
							return 'dvd';
						default:
							return 'aps';
					}
				})();
				return 'http://www.amazon.com/s/ref=openlike?url=search-alias%3D'+alias+'&field-keywords='+title+'&x=0&y=0';
			},
			title: 'Search this on Amazon'
		},
		
		'getglue': {
			url: 'http://getglue.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://getglue.com/search?q=' + title;
			},
			title: 'Like this on GetGlue'
		},
		
		'goodreads': {
			url: 'http://goodreads.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.goodreads.com/search/search?search_type=books&search[query]=' + title;
			},
			title: 'Search this on GoodReads'
		},
		
		'shelfari': {
			url: 'http://shelfari.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.shelfari.com/search/books?Keywords=' + title;
			},
			title: 'Search this on Shelfari'
		},
		
		'librarything': {
			url: 'http://librarything.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://www.librarything.com/search_works.php?q=' + title;
			},
			title: 'Search this on LibraryThing'
		},
		
		'weread': {
			url: 'http://weread.com',
			basicLink: function(a, cfg) {
				var title = encodeURIComponent(cfg.title);
				return 'http://weread.com/search/book/' + title;
			},
			title: 'Search this on WeRead'
		}
		
	};
	
	return ns;
	
})(OPENLIKE || {})
