STANDALONE      = name=../lib/almond include=main wrap=true
BUILDJS         = bundles/build.js
RJS		= lib/r.js
PHANTOMJS	?= phantomjs
SOURCES		= src/lib/jquery.form $(wildcard src/*.js) $(wildcard src/*/*.js)
TARGETS		= bundles/patterns.js bundles/patterns.min.js bundles/patterns-standalone.js bundles/patterns-standalone.min.js

all:: $(TARGETS)

bundles/patterns.js: $(SOURCES) $(BUILDJS)
	node $(RJS) -o $(BUILDJS) out=$@ optimize=none

bundles/patterns.min.js: $(SOURCES) $(BUILDJS)
	node $(RJS) -o $(BUILDJS) out=$@ optimize=uglify

bundles/patterns-standalone.js: $(BUILDJS)
	node $(RJS) -o $(BUILDJS) out=$@ optimize=none $(STANDALONE)

bundles/patterns-standalone.min.js: $(BUILDJS)
	node $(RJS) -o $(BUILDJS) out=$@ optimize=uglify $(STANDALONE)

lib/phantom-jasmine src/lib/jquery.form lib/requirejs:
	git submodule update --init --recursive

all:: build/docs/index.html

build/docs/index.html: docs/conf.py $(wildcard docs/*.rst) $(wildcard docs/*/*.rst)
	sphinx-build -b html docs build/docs

check: lib/phantom-jasmine
	$(PHANTOMJS) lib/phantom-jasmine/lib/run_jasmine_test.coffee tests/index.html

clean:
	rm -f $(TARGETS)

upgrade-requirejs:
	curl -s -o $(RJS) $(shell curl -s http://requirejs.org/docs/download.html | sed -ne '/download.*\/r.js/s/.*href="\([^"]*\).*/\1/p')
	curl -s -o lib/require.js $(shell curl -s http://requirejs.org/docs/download.html | sed -ne '/download.*\/comments\/require.js/s/.*href="\([^"]*\).*/\1/p')
	curl -s -o lib/require.min.js $(shell curl -s http://requirejs.org/docs/download.html | sed -ne '/download.*\/minified\/require.js/s/.*href="\([^"]*\).*/\1/p')

	rm -f lib/require-jquery.zip
	curl -s -o lib/require-jquery.zip $(shell curl -s http://requirejs.org/docs/download.html | sed -ne '/download.*jquery/s/.*href="\([^"]*\).*/\1/p')
	unzip -p lib/require-jquery.zip jquery-require-sample/webapp/scripts/require-jquery.js > lib/require-jquery.js
	rm lib/require-jquery.zip


localize-demo-images:
	tools/localize-demo-images.sh

.PHONY: all clean check upgrade-requirejs
