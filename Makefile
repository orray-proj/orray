## Tool Binaries
KUBECTL ?= kubectl
CONTROLLER_GEN ?= go tool sigs.k8s.io/controller-tools/cmd/controller-gen
ENVTEST ?= go tool sigs.k8s.io/controller-runtime/tools/setup-envtest
KUSTOMIZE ?= go tool sigs.k8s.io/kustomize/kustomize/v5
GOLANGCI_LINT = go tool github.com/golangci/golangci-lint/cmd/golangci-lint
CTLPTL ?= ./bin/ctlptl

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
	$(CONTROLLER_GEN) crd paths="./..." output:crd:artifacts:config=charts/web-operator/resources/crds

.PHONY: generate
generate: ## Generate code containing DeepCopy, DeepCopyInto, and DeepCopyObject method implementations.
	$(CONTROLLER_GEN) object:headerFile="hack/boilerplate.go.txt" paths="./..."

.PHONY: fmt
fmt: ## Run go fmt against code.
	go fmt ./...

.PHONY: vet
vet: ## Run go vet against code.
	go vet ./...

.PHONY: test
test: manifests generate fmt vet ## Run tests.
	KUBEBUILDER_ASSETS="$(shell $(ENVTEST) use $(KUBERNETES_VERSION) -p path)" go test $$(go list ./... | grep -v /e2e | grep -v /api | grep -v /cmd) -coverprofile cover.out

.PHONY: lint
lint: ## Run golangci-lint linter
	$(GOLANGCI_LINT) run

.PHONY: lint-fix
lint-fix: ## Run golangci-lint linter and perform fixes
	$(GOLANGCI_LINT) run --fix

.PHONY: lint-config
lint-config: ## Verify golangci-lint linter configuration
	$(GOLANGCI_LINT) config verify

##@ Build

.PHONY: build
build: manifests generate fmt vet ## Build manager binary.
	go build -o bin/web-operator ./cmd/controlplane

.PHONY: build-image
build-image: ## Build the image
	docker build -t ghcr.io/orray-proj/orray:1.0.0 -f Dockerfile \
		--build-arg VERSION=1.0.0 \
		--build-arg GIT_COMMIT=1234567890 \
		--build-arg GIT_TREE_STATE=dirty \
		--build-arg TARGETARCH=amd64 \
		.

##@ Test

.PHONY: test-kuttl
test-kuttl: build-image ## Run KUTTL tests
	cd tests && kubectl kuttl test --config kuttl-test.yaml

##@ Hack
.PHONY: hack-kind-up
hack-kind-up:
	$(CTLPTL) apply -f hack/kind/cluster.yaml
	make hack-install-prereqs

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
