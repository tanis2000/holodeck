.PHONY build:
build:
	pnpm build

.PHONY dev:
dev:
	pnpm dev

.PHONY archive:
archive:
	cd ./dist/ && \
		rm holodeck.zip ; \
		zip -r holodeck.zip *