# Kubernetes (base) – Validador de Entrega

## Visão
- Imagem única (Express + front estático) usando o `Dockerfile` raiz.
- Namespace: `validador`.
- Objetos: `Deployment`, `Service` ClusterIP, `Secret` com placeholders de Supabase, `Ingress` opcional comentado.
- Você preencherá a imagem `<your-registry>/validador:tag` e os segredos.

## Estrutura
- `k8s/base/namespace.yaml`
- `k8s/base/deployment.yaml`
- `k8s/base/service.yaml`
- `k8s/base/secret-placeholder.yaml`
- `k8s/base/ingress.example.yaml` (comentado, para futuro)

## Imagem (build/push)
```bash
# Na raiz do repo
docker build -t <your-registry>/validador:tag .
docker push <your-registry>/validador:tag
```
> Em registry privado, crie um Secret `imagePullSecret` e referencie em `spec.template.spec.imagePullSecrets` do Deployment.

## Preparar secrets
Edite `k8s/base/secret-placeholder.yaml` com valores reais. Opcionalmente gere via cli:
```bash
kubectl -n validador create secret generic validador-supabase \
  --from-literal=SUPABASE_URL="<url>" \
  --from-literal=SUPABASE_SERVICE_KEY="<service-key>"
```

## Deploy
```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/secret-placeholder.yaml
kubectl apply -f k8s/base/deployment.yaml
kubectl apply -f k8s/base/service.yaml
# Ingress opcional (quando houver controlador/dominio)
# kubectl apply -f k8s/base/ingress.example.yaml
```

## Testes locais (kind/minikube)
- Build local e use `kind load docker-image <your-registry>/validador:tag --name <cluster>` ou `minikube image load ...`.
- Aplique os manifests. Como o Service é `ClusterIP`, para testar use `kubectl port-forward svc/validador-app -n validador 3000:80` e acesse `http://localhost:3000`.

## Ajustes sugeridos
- Réplicas: `spec.replicas` (hoje 2).
- Recursos: requests 100m/128Mi e limits 300m/512Mi — ajuste conforme métricas.
- Probes: `/health` já exposto no Express.
- Variáveis adicionais: adicione em `env:` no Deployment; para valores sensíveis, use Secrets.

