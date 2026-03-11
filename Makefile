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
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

.PHONY: manifests
manifests: ## Generate CustomResourceDefinition objects.
	$(CONTROLLER_GEN) crd paths="./..." output:crd:artifacts:config=charts/orray/resources/crds

.PHONY: generate
generate: codegen-opanapi codegen-docs ## Generate code containing DeepCopy, DeepCopyInto, and DeepCopyObject method implementations.
	$(CONTROLLER_GEN) object:headerFile="hack/boilerplate.go.txt" paths="./..."

.PHONY: codegen-opanapi
codegen-opanapi:
	rm -f api/swagger.yaml api/swagger.json
	rm -rf /tmp/swagger-build
	mkdir -p /tmp/swagger-build
	$(SWAG) init \
	    --generalInfo pkg/rest/router.go \
		--output /tmp/swagger-build \
		--parseDependency \
		--parseInternal \
		--outputTypes yaml,json
	mv /tmp/swagger-build/swagger.yaml api/
	mv /tmp/swagger-build/swagger.json api/
	rm -rf /tmp/swagger-build

.PHONY: codegen-docs
codegen-docs:
	bun install -g @bitnami/readme-generator-for-helm
	bash hack/helm-docs/helm-docs.sh

.PHONY: fmt
fmt: ## Run go fmt against code.
	go fmt ./...

.PHONY: vet
vet: ## Run go vet against code.
	go vet ./...

.PHONY: test
test: manifests generate fmt vet ## Run tests.
	KUBEBUILDER_ASSETS="$(shell $(ENVTEST) use $(KUBERNETES_VERSION) -p path)" go test $$(go list ./... | grep -v /api | grep -v /cmd) -coverprofile cover.out

.PHONY: lint
lint: lint-go ui-lint docs-lint ## Run all linters

custom-gcl:
	go tool github.com/golangci/golangci-lint/v2/cmd/golangci-lint custom

.PHONY: lint-go
lint-go: custom-gcl ## Run golangci-lint linter
	$(GOLANGCI_LINT) run

.PHONY: lint-go-fix
lint-go-fix: custom-gcl ## Run golangci-lint linter and perform fixes
	$(GOLANGCI_LINT) run --fix

.PHONY: lint-go-config
lint-go-config: custom-gcl ## Verify golangci-lint linter configuration
	$(GOLANGCI_LINT) config verify

##@ UI

.PHONY: ui-install
ui-install: ## Install UI dependencies
	cd ui && bun install

.PHONY: ui-dev
ui-dev: ## Start UI dev server
	cd ui && bun run dev

.PHONY: ui-build
ui-build: ui-install ## Build UI static assets
	cd ui && bun run build
	rm -rf pkg/ui/dist
	cp -r ui/dist pkg/ui/dist

.PHONY: ui-lint
ui-lint: ## Lint UI code
	cd ui && bun run lint

.PHONY: ui-types
ui-types: ## Type-check UI code
	cd ui && bun run types:check

.PHONY: ui-test
ui-test: ## Run UI tests
	cd ui && bun run test

##@ Docs

.PHONY: docs-install
docs-install: ## Install docs dependencies
	cd docs && bun install

.PHONY: docs-dev
docs-dev: ## Start docs dev server
	cd docs && bun run dev

.PHONY: docs-build
docs-build: docs-install ## Build docs site
	cd docs && bun run build

.PHONY: docs-lint
docs-lint: ## Lint docs
	cd docs && bunx ultracite check

##@ Build

.PHONY: build
build: manifests generate fmt vet ## Build manager binary.
	go build -o bin/orray ./cmd/controlplane

.PHONY: build-image
build-image: ## Build the image
	docker build -t ghcr.io/orray-proj/orray:1.0.0 -f Dockerfile \
		--build-arg VERSION=1.0.0 \
		--build-arg GIT_COMMIT=1234567890 \
		--build-arg GIT_TREE_STATE=dirty \
		--build-arg TARGETARCH=amd64 \

##@ Hack
.PHONY: hack-kind-up
hack-kind-up:
	$(CTLPTL) apply -f hack/kind/cluster.yaml

.PHONY: hack-kind-down
hack-kind-down:
	$(CTLPTL) delete -f hack/kind/cluster.yaml

.PHONY: hack-install-prereqs
hack-install-prereqs: hack-install-cert-manager

.PHONY: hack-install-cert-manager
hack-install-cert-manager:
	helm upgrade cert-manager cert-manager \
		--repo https://charts.jetstack.io \
		--version $(CERT_MANAGER_CHART_VERSION) \
		--install \
		--create-namespace \
		--namespace cert-manager \
		--set crds.enabled=true \
		--wait
