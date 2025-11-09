worker:
	docker build -t parivyaya-worker -f Dockerfile.worker .

ui-dev:
	cd ui && npm run dev

ui-build:
	cd ui && npm run build

ui-start:
	cd ui && npm run start
