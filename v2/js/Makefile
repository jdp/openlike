SRC = xauth.js openlike.js preferences.js ui.js
OUT = release.js
CURL = curl
CLOSURE = closure-compiler.appspot.com/compile

$(OUT):
	cat $(SRC) > composite
	$(CURL) --data-urlencode js_code@composite --data "output_format=text&output_info=compiled_code&compilation_level=WHITESPACE_ONLY" $(CLOSURE) > $(OUT)
	rm -f composite