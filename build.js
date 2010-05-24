var sys = require('sys'),
    fs = require('fs'),
    http = require('http'),
    querystring = require('querystring');

var js_code = ['openlike', 'preferences', 'ui', 'xauth'].map(function(e, i) {
	return 'v2/js/' + e + '.js';
}).map(function(e, i) {
	return fs.readFileSync(e);
}).join('');

var compiler = http.createClient(80, 'closure-compiler.appspot.com');
var request = compiler.request('POST', '/compile', {
	'Host': 'closure-compiler.appspot.com',
	'Content-type': 'application/x-www-form-urlencoded',
	'Transfer-encoding': 'chunked'
});

request.addListener('response', function(response) {
	var body = "";
	response.setEncoding('utf8');
	response.addListener('data', function(chunk) {
		body += chunk;
	}).addListener('end', function() {
		sys.print(body);
	});
});

request.write(querystring.stringify({
	'js_code': js_code,
	'compilation_level': 'SIMPLE_OPTIMIZATIONS',
	'output_format': 'text',
	'output_info': 'compiled_code'
}));

request.end();
