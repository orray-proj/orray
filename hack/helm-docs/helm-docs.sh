set -e

# bun install -g @bitnami/readme-generator-for-helm
readme-generator --values "${PWD}/charts/orray/values.yaml" --readme "${PWD}/charts/orray/README.md" --config "${PWD}/hack/helm-docs/readme-generator-config.json"
