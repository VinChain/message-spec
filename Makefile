AJV=node_modules/.bin/ajv
AJV_FLAGS=--missing-refs=ignore --extend-refs=false
SCHEMA_DIR=schema
PREFIX=http://example.com/test/

compile-schema:
	rm -rf $(SCHEMA_DIR)/*
	DEBUG=* bin/schema-compiler compile -o $(SCHEMA_DIR) 'src/schema/**/*.json'

validate-schema: compile-schema
	for file in `find $(SCHEMA_DIR) -type f`; do \
		echo "Validating: $$file"; \
		$(AJV) compile $(AJV_FLAGS) -s $$file; \
		echo ""; \
	done;
