trigger_mode(TRIGGER_MODE_MANUAL)
allow_k8s_contexts('orbstack')

load('ext://namespace', 'namespace_create')

# Install cluster-level prerequisites. These use local_resource (not k8s_yaml)
# so that tilt down will NOT remove them.
local_resource(
  'ensure-cert-manager',
  'helm status cert-manager -n cert-manager > /dev/null 2>&1 || make dev-install-cert-manager',
  labels = ['prereqs'],
)

local_resource(
  'back-end-compile',
  'CGO_ENABLED=0 GOOS=linux GOARCH=$(go env GOARCH) go build -o bin/controlplane/orray ./cmd/controlplane',
  deps=[
    'api/',
    'cmd/controlplane/',
    'pkg/',
    'go.mod',
    'go.sum'
  ],
  labels = ['native-processes'],
  trigger_mode = TRIGGER_MODE_AUTO
)
docker_build(
  'ghcr.io/orray-proj/orray',
  '.',
  only = [
    'bin/controlplane/orray'
  ],
  target = 'back-end-dev', # Just the back end, built natively, copied to the image
)

docker_build(
  'orray-ui',
  '.',
  only = ['ui/'],
  target = 'ui-dev', # Just the font end, served by vite, live updated
  live_update = [sync('ui', '/ui')]
)

namespace_create('orray')
k8s_resource(
  new_name = 'namespaces',
  objects = [
    'orray:namespace'
  ],
  labels = ['orray']
)

k8s_yaml(
  helm(
    './charts/orray',
    name = 'orray',
    namespace = 'orray',
    values = 'hack/tilt/values.dev.yaml'
  )
)

# Normally the API server serves up the front end, but we want live updates
# of the UI, so we're breaking it out into its own separate deployment here.
k8s_yaml('hack/tilt/ui.yaml')

k8s_resource(
  new_name = 'common',
  labels = ['orray'],
  objects = [
    # 'orray-admin:clusterrole',
    # 'orray-admin:clusterrolebinding',
    # 'orray-admin:role',
    # 'orray-admin:rolebinding',
    # 'orray-admin:serviceaccount',
    'orray-selfsigned-cert-issuer:issuer'
  ],
  resource_deps = ['ensure-cert-manager']
)

k8s_resource(
  workload = 'orray-apiserver',
  new_name = 'api',
  port_forwards = [
    '30081:8080'
  ],
  labels = ['orray'],
  objects = [
    'orray-apiserver:clusterrole',
    'orray-apiserver:clusterrolebinding',
    'orray-apiserver:configmap',
    'orray-apiserver:serviceaccount'
  ],
  resource_deps=['back-end-compile']
)

k8s_resource(
  workload = 'orray-controller',
  new_name = 'controller',
  labels = ['orray'],
  objects = [
    'orray-controller:clusterrole',
    'orray-controller:clusterrolebinding',
    'orray-controller:configmap',
    'orray-controller:serviceaccount'
  ],
  resource_deps=['back-end-compile', ]
)

k8s_resource(
  workload = 'orray-ui',
  new_name = 'ui',
  port_forwards = [
    '30082:3333'
  ],
  labels = ['orray'],
  trigger_mode = TRIGGER_MODE_AUTO
)

k8s_resource(
  workload = 'orray-webhooks-server',
  new_name = 'webhooks-server',
  labels = ['orray'],
  objects = [
    'orray:validatingwebhookconfiguration',
    'orray-webhooks-server:certificate',
    'orray-webhooks-server:clusterrole',
    'orray-webhooks-server:clusterrolebinding',
    'orray-webhooks-server:configmap',
    'orray-webhooks-server:serviceaccount',
  ],
  resource_deps=['back-end-compile', 'ensure-cert-manager']
)

k8s_resource(
  new_name = 'crds',
  objects = [
    'canvases.orray.dev:customresourcedefinition',
  ],
  labels = ['orray']
)
