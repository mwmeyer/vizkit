src = \
	src/start.js \
	src/utils.js \
	src/barchart.js \
	src/linechart.js \
	src/piechart.js \
	src/gauge.js \
	src/end.js

vizkit.js: $(src)
vizkit.min.js: $(src)

vizkit.js: Makefile
	rm -f $@
	cat $(filter %.js,$^) >> $@

vizkit.min.js: Makefile
	rm -f $@
	cat $(filter %.js,$^) | uglifyjs >> $@

clean:
	rm -rf vizkit.js vizkit.min.js