.PHONY: dev build up down logs psql clean clean-db help

# Development
dev: ## Start UI in dev mode
	cd ui && npm run dev

# Docker Compose
build: ## Build all Docker images
	docker build -t parivyaya-worker:latest -f Dockerfile.worker .
	docker build -t parivyaya-ui:latest -f Dockerfile.ui .

up: ## Start all services with docker-compose
	docker-compose up --build -d

down: ## Stop all services
	docker-compose down

logs: ## Show docker-compose logs
	docker-compose logs -f

psql: ## Open psql shell
	docker-compose exec postgres psql -U postgres -d parivyaya

clean: ## Clean up everything
	docker-compose down
	@echo "✅ Cleaned up"

clean-db: ## Clean postgres data
	docker-compose down -v
	@echo "✅ Postgres data cleaned"

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

