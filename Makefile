default: compress

compress:
	@node bin/build.js;
  
test:
	@mocha \
		-t 2000 \
		$(TESTFLAGS) \
		$(TESTS)
    
.PHONY: test