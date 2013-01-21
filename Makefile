.PHONY : help build clean
BUILDID=$(shell date +%F.%H%M)

help:
	@echo "make build:"
	@echo "    build the webpage"
	@echo "make clean:"
	@echo "    remove build artifacts"

build: clean
build:
	@echo "Building..."
	mkdir build
	# Copy all files (excluding JS/CSS source files) to the build directory
	rsync -r src/* build/ --exclude=sass --exclude=js/*
	# Include modernizr.js and farbtastic files
	rsync -r src/js/lib/modernizr.js src/js/lib/farbtastic build/js/lib
	# Minify & concatenate JS
	jammit -c jammit.yml -o build/js
	# Uncomment minified js / remove dev.js
	perl -pi -e 's/<!-- scripts concatenated/<!-- scripts concatenated -->/' build/*.html
	perl -pi -e 's/\/scripts concatenated -->/<!-- \/scripts concatenated -->/' build/*.html
	perl -ni -e 'print unless /<!-- scripts development -->/../<!-- \/scripts development -->/' build/*.html
	# Add cache busting querystring to assets
	perl -pi -e 's/{{BUILDID}}/'"$(BUILDID)"'/' build/*.html
	# Create a tar-ball
	tar -czf "twitterfontana.$(BUILDID).tgz" build
	@echo "Done!"

clean:
	@echo "Cleaning..."
	-rm -rf ./build
	-rm twitterfontana.*.tgz
	@echo "Done!"
