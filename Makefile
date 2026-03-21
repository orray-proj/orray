## Tool Binaries
KUBECTL ?= kubectl
CONTROLLER_GEN ?= go tool sigs.k8s.io/controller-tools/cmd/controller-gen
ENVTEST ?= go tool sigs.k8s.io/controller-runtime/tools/setup-envtest
KUSTOMIZE ?= go tool sigs.k8s.io/kustomize/kustomize/v5
GOLANGCI_LINT = ./custom-gcl
CTLPTL ?= go tool github.com/tilt-dev/ctlptl/cmd/ctlptl
SWAG ?= go run github.com/swaggo/swag/cmd/swag

KUBERNETES_VERSION ?= 1.34.0
CERT_MANAGER_CHART_VERSION 	:= 1.16.1

# Get the currently used golang install path (in GOPATH/bin, unless GOBIN is set)
ifeq (,$(shell go env GOBIN))
GOBIN=$(shell go env GOPATH)/bin
else
GOBIN=$(shell go env GOBIN)
endif

# Setting SHELL to bash allows bash commands to be executed by recipes.
# Options are set to exit when a recipe line exits non-zero or a piped command fails.
SHELL = /usr/bin/env bash -o pipefail
.SHELLFLAGS = -ec

.PHONY: all
all: build

##@ General

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: lint
lint: go-lint ui-lint docs-lint ## Run all linters.

.PHONY: lint-fix
lint-fix: go-lint-fix ui-lint-fix docs-lint-fix ## Run all linters with auto-fix.

.PHONY: test
test: go-test ## Run all tests.

.PHONY: build
build: go-build ## Build all artifacts.

##@ Codegen

.PHONY: generate
generate: gen-crds gen-deepcopy gen-openapi gen-helm-docs gen-ui ## Run all code generation.

.PHONY: gen-crds
gen-crds: ## Generate CustomResourceDefinition objects.
	$(CONTROLLER_GEN) crd paths="./api/..." output:crd:artifacts:config=charts/orray/resources/crds

.PHONY: gen-deepcopy
gen-deepcopy: ## Generate DeepCopy method implementations.
	$(CONTROLLER_GEN) object:headerFile="hack/boilerplate.go.txt" paths="./api/..."

.PHONY: gen-openapi
gen-openapi: ## Generate OpenAPI/Swagger docs from annotations.
	rm -f api/swagger.yaml api/swagger.json
	rm -rf api/docs
	$(SWAG) init \
	    --generalInfo pkg/rest/router.go \
		--output api/docs \
		--parseDependency \
		--parseInternal \
		--useStructName \
		--outputTypes yaml,json,go
	mv api/docs/swagger.yaml api/
	mv api/docs/swagger.json api/

.PHONY: gen-helm-docs
gen-helm-docs: ## Generate Helm chart documentation.
	bash hack/helm-docs/helm-docs.sh

.PHONY: gen-ui
gen-ui: gen-openapi ## Generate UI client from OpenAPI spec.
	cd ui && bun run codegen

##@ Go

.PHONY: go-build
go-build: gen-crds gen-deepcopy go-fmt go-vet ## Build Go binary.
	go build -o bin/orray ./cmd/controlplane

.PHONY: go-fmt
go-fmt: ## Run go fmt.
	go fmt ./...

.PHONY: go-vet
go-vet: ## Run go vet.
	go vet ./...

.PHONY: go-test
go-test: gen-crds gen-deepcopy go-fmt go-vet ## Run Go tests.
	KUBEBUILDER_ASSETS="$(shell $(ENVTEST) use $(KUBERNETES_VERSION) -p path)" go test $$(go list ./... | grep -v /api | grep -v /cmd) -coverprofile cover.out

custom-gcl:
	go tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint custom

.PHONY: go-lint
go-lint: custom-gcl ## Run golangci-lint.
	$(GOLANGCI_LINT) run

.PHONY: go-lint-fix
go-lint-fix: custom-gcl ## Run golangci-lint with auto-fix.
	$(GOLANGCI_LINT) run --fix

.PHONY: go-lint-config
go-lint-config: custom-gcl ## Verify golangci-lint configuration.
	$(GOLANGCI_LINT) config verify

##@ UI

.PHONY: ui-install
ui-install: ## Install UI dependencies.
	cd ui && bun install

.PHONY: ui-dev
ui-dev: ## Start UI dev server.
	cd ui && bun run dev

.PHONY: ui-build
ui-build: ui-install ## Build UI static assets.
	cd ui && bun run build
	rm -rf pkg/ui/dist
	cp -r ui/dist pkg/ui/dist

.PHONY: ui-lint
ui-lint: ## Lint UI code.
	cd ui && bun run lint

.PHONY: ui-lint-fix
ui-lint-fix: ## Lint UI code with auto-fix.
	cd ui && bunx biome check --fix

.PHONY: ui-types
ui-types: ## Type-check UI code.
	cd ui && bun run types:check

.PHONY: ui-test
ui-test: ## Run UI tests.
	cd ui && bun run test

##@ Docs

.PHONY: docs-install
docs-install: ## Install docs dependencies.
	cd docs && bun install

.PHONY: docs-dev
docs-dev: ## Start docs dev server.
	cd docs && bun run dev

.PHONY: docs-build
docs-build: docs-install ## Build docs site.
	cd docs && bun run build

.PHONY: docs-lint
docs-lint: ## Lint docs.
	cd docs && bunx ultracite check

.PHONY: docs-lint-fix
docs-lint-fix: ## Lint docs with auto-fix.
	cd docs && bunx biome check --fix

.PHONY: docs-types
docs-types: ## Type-check docs code.
	cd docs && bun run types:check

##@ Docker

.PHONY: docker-build
docker-build: ## Build the Docker image.
	docker build -t ghcr.io/orray-proj/orray:1.0.0 -f Dockerfile \
		--build-arg VERSION=1.0.0 \
		--build-arg GIT_COMMIT=1234567890 \
		--build-arg GIT_TREE_STATE=dirty \
		--build-arg TARGETARCH=amd64 \

##@ Dev Environment

.PHONY: dev-cluster-up
dev-cluster-up: ## Create a local Kind cluster.
	$(CTLPTL) apply -f hack/kind/cluster.yaml

.PHONY: dev-cluster-down
dev-cluster-down: ## Tear down the local Kind cluster.
	$(CTLPTL) delete -f hack/kind/cluster.yaml

.PHONY: dev-install-prereqs
dev-install-prereqs: dev-install-cert-manager ## Install all dev prerequisites.

.PHONY: dev-install-cert-manager
dev-install-cert-manager: ## Install cert-manager into the cluster.
	helm upgrade cert-manager cert-manager \
		--repo https://charts.jetstack.io \
		--version $(CERT_MANAGER_CHART_VERSION) \
		--install \
		--create-namespace \
		--namespace cert-manager \
		--set crds.enabled=true \
		--wait
