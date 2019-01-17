AJV=node_modules/.bin/ajv
AJV_FLAGS=--missing-refs=ignore --extend-refs=false
SCHEMA_DIR=schema


all: clean build


clean:
	rm -rf schema
	rm -rf compiler

build:
	npm run build-compiler
	npm run build-schema
	npm run build-typings

validate-schema: build
	for file in `find $(SCHEMA_DIR) -type f`; do \
		echo "Validating: $$file"; \
		$(AJV) compile $(AJV_FLAGS) -s $$file; \
		echo ""; \
	done;
