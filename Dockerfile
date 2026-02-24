####################################################################################################
# back-end-builder
####################################################################################################
FROM --platform=$BUILDPLATFORM golang:1.25.5-bookworm AS back-end-builder

ARG TARGETOS
ARG TARGETARCH

ARG VERSION_PACKAGE=github.com/orray-proj/orray/pkg/version

ARG CGO_ENABLED=0

WORKDIR /orray
COPY ["go.mod", "go.sum", "./"]
RUN go mod download
COPY api/ api/
COPY cmd/ cmd/
COPY pkg/ pkg/

ARG VERSION
ARG GIT_COMMIT
ARG GIT_TREE_STATE

RUN CGO_ENABLED=${CGO_ENABLED} GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH} go build \
    -ldflags="-s -w -X ${VERSION_PACKAGE}.version=${VERSION} -X ${VERSION_PACKAGE}.buildDate=$(date -u +'%Y-%m-%dT%H:%M:%SZ') -X ${VERSION_PACKAGE}.gitCommit=${GIT_COMMIT} -X ${VERSION_PACKAGE}.gitTreeState=${GIT_TREE_STATE}" \
    -o bin/orray ./cmd/controlplane

####################################################################################################
# back-end-dev
# - no UI
# - relies on go build that runs on host
# - supports development
# - not used for official image builds
####################################################################################################
FROM alpine:latest AS back-end-dev

RUN apk update && apk add ca-certificates git gpg gpg-agent openssh-client tini

COPY ./bin/controlplane/orray /usr/local/bin/orray

RUN adduser -D -H -u 1000 orray
USER 1000:0

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/local/bin/orray"]

####################################################################################################
# final
# - the official image we publish
# - purposefully last so that it is the default target when building
####################################################################################################
FROM alpine:latest AS final


RUN apk update && apk add ca-certificates git gpg gpg-agent openssh-client tini

COPY --from=back-end-builder /orray/bin/ /usr/local/bin/

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/local/bin/orray"]
