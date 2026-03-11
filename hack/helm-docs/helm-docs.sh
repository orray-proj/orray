set -e

bunx @bitnami/readme-generator-for-helm --values "${PWD}/charts/orray/values.yaml" --readme "${PWD}/charts/orray/README.md" --config "${PWD}/hack/helm-docs/readme-generator-config.json"
