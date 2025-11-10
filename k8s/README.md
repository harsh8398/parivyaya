# Kubernetes Deployment for Parivyaya

This directory contains Kubernetes manifests for deploying the Parivyaya application.

## Prerequisites

- Kubernetes cluster (kind, minikube, or cloud provider)
- kubectl configured to connect to your cluster
- Docker images built for worker and UI

## Building Docker Images

Before deploying, build the required Docker images:

```bash
# Build worker image
docker build -t parivyaya-worker:latest -f Dockerfile.worker .

# Build UI image
docker build -t parivyaya-ui:latest -f Dockerfile.ui .
```

### Load images into your cluster:

**For kind:**
```bash
kind load docker-image parivyaya-worker:latest
kind load docker-image parivyaya-ui:latest
```

**For minikube:**
```bash
minikube image load parivyaya-worker:latest
minikube image load parivyaya-ui:latest
```

## Configuration

1. Update the Google API key in `worker.yaml`:
   ```yaml
   stringData:
     GOOGLE_API_KEY: "your-actual-api-key"
   ```

2. If using a custom domain, update the host in `ingress.yaml`

## Deployment

Apply the manifests in order:

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy database and message broker
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/kafka.yaml

# Wait for postgres and kafka to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n parivyaya --timeout=120s
kubectl wait --for=condition=ready pod -l app=broker -n parivyaya --timeout=120s

# Deploy application services
kubectl apply -f k8s/worker.yaml
kubectl apply -f k8s/ui.yaml

# Optional: Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

Or apply all at once:
```bash
kubectl apply -f k8s/
```

## Accessing the Application

### Using LoadBalancer (UI Service)
```bash
kubectl get svc -n parivyaya ui
# Access via the EXTERNAL-IP on port 3000
```

### Using Port Forwarding
```bash
# Forward UI service
kubectl port-forward -n parivyaya svc/ui 3000:3000

# Forward worker service (API)
kubectl port-forward -n parivyaya svc/worker 8000:80
```

Then access:
- UI: http://localhost:3000
- API: http://localhost:8000

### Using Ingress
If you deployed the ingress:
1. Install nginx ingress controller (if not already installed):
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

2. Add to `/etc/hosts`:
   ```
   <ingress-ip> parivyaya.local
   ```

3. Access: http://parivyaya.local

## Monitoring

Check pod status:
```bash
kubectl get pods -n parivyaya
```

View logs:
```bash
# UI logs
kubectl logs -n parivyaya -l app=ui -f

# Worker logs
kubectl logs -n parivyaya -l app=worker -f

# Postgres logs
kubectl logs -n parivyaya -l app=postgres -f

# Kafka logs
kubectl logs -n parivyaya -l app=broker -f
```

## Scaling

Scale the UI deployment:
```bash
kubectl scale deployment ui -n parivyaya --replicas=3
```

Scale the worker deployment:
```bash
kubectl scale deployment worker -n parivyaya --replicas=2
```

## Cleanup

Remove all resources:
```bash
kubectl delete namespace parivyaya
```

Or remove specific resources:
```bash
kubectl delete -f k8s/
```
