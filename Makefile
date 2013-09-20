.PHONY : help build clean
BUILDID=$(shell date +%F.%H%M)

help:
	@echo "make build:"
	@echo "    create a tar for deployment"
	@echo "make clean:"
	@echo "    remove built tar file(s)"

build: clean
build:
	@echo "Building..."
	tar -czf "twitterfontana.$(BUILDID).tgz" requirements.txt backend/ frontend/httpdocs/
	@echo "Done!"

clean:
	@echo "Cleaning..."
	rm -rf ./build
	rm -f twitterfontana.*.tgz
	@echo "Done!"
