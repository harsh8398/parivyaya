.PHONY: dev build up down deploy logs clean help

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

# Kubernetes
deploy: build ## Deploy to Kubernetes (kind)
	kind load docker-image parivyaya-worker:latest
	kind load docker-image parivyaya-ui:latest
	kubectl apply -f k8s/
	@echo "Waiting for services to be ready..."
	@kubectl wait --for=condition=ready pod -l app=postgres -n parivyaya --timeout=120s 2>/dev/null || true
	@kubectl wait --for=condition=ready pod -l app=broker -n parivyaya --timeout=120s 2>/dev/null || true
	@echo "\n✅ Deployed! Access via: kubectl port-forward -n parivyaya svc/ui 3000:3000"

logs: ## Show all logs (k8s or docker-compose)
	@if kubectl get namespace parivyaya 2>/dev/null; then \
		kubectl logs -n parivyaya -l app=ui --tail=50; \
	else \
		docker-compose logs -f; \
	fi

psql: ## Open psql shell (k8s or docker-compose)
	@if kubectl get namespace parivyaya 2>/dev/null; then \
		kubectl exec -it -n parivyaya deployment/postgres -- psql -U postgres -d parivyaya; \
	else \
		docker-compose exec postgres psql -U postgres -d parivyaya; \
	fi

clean: ## Clean up everything
	@docker-compose down 2>/dev/null || true
	@kubectl delete namespace parivyaya --ignore-not-found=true
	@echo "✅ Cleaned up"

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

