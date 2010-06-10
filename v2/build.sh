#!/bin/sh

WIDGET_SRC="common/services.js common/preferences.js widget/js/widget.js widget/js/util.js widget/js/ui.js"
WIDGET="openlike.js"
WIDGET_CSS="widget/css/openlike.css"
WIDGET_CSS_OUT="openlike.css"
SERVER_SRC="common/services.js common/preferences.js server/server.js"
SERVER_HTML="../server.html"
CURL=curl
CLOSURE="closure-compiler.appspot.com/compile"
COMP_LVL="SIMPLE_OPTIMIZATIONS"

# Uses Closure Compiler to minify Javascript
# Usage:
#    minify <outfile> <infiles>
minify()
{
	outfile=$1
	shift $@
	infiles=$*
	cat $infiles > $outfile
	$CURL --data-urlencode js_code@$outfile --data "output_format=text&output_info=compiled_code&compilation_level=$COMP_LVL" $CLOSURE > $outfile
}

while getopts "r" o
do
	case "$o" in
		r) RELEASE="true";;
	esac
done

echo "Building $WIDGET_SRC to $WIDGET"
cat $WIDGET_SRC > $WIDGET

echo "Minifying $WIDGET_CSS to $WIDGET_CSS_OUT"
cat $WIDGET_CSS > $WIDGET_CSS_OUT

echo "Building server"
echo "<!doctype html><script type=\"text/javascript\">" > $SERVER_HTML
cat $SERVER_SRC >> $SERVER_HTML
echo "</script>" >> $SERVER_HTML

echo "Done"


