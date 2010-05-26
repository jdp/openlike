#!/bin/sh

WIDGET_SRC="js/widget/xauth.js js/widget/widget.js js/widget/preferences.js js/widget/ui.js"
WIDGET="widget.js"
PUBLISHER_SRC="js/publisher/openlike.js"
PUBLISHER="openlike.js"
CURL=curl
CLOSURE="closure-compiler.appspot.com/compile"

echo "Building $WIDGET"
cat $WIDGET_SRC > composite
$CURL --data-urlencode js_code@composite --data "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" $CLOSURE > $WIDGET

echo "Building $PUBLISHER"
cat $PUBLISHER_SRC > composite
$CURL --data-urlencode js_code@composite --data "output_format=text&output_info=compiled_code&compilation_level=ADVANCED_OPTIMIZATIONS" $CLOSURE > $PUBLISHER

echo "Cleaning up"
rm -f composite

echo "Done"


