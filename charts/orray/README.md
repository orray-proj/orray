## Parameters

### Image Parameters

| Name                | Description                                                                  | Value                      |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| `image.repository`  | Image repository of orray                                                    | `ghcr.io/orray-proj/orray` |
| `image.tag`         | Overrides the image tag. The default tag is the value of `.Chart.AppVersion` | `""`                       |
| `image.pullPolicy`  | Image pull policy                                                            | `IfNotPresent`             |
| `image.pullSecrets` | List of imagePullSecrets.                                                    | `[]`                       |

### CRDs

| Name           | Description                                                                                                                                                                        | Value  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `crds.install` | Indicates if Custom Resource Definitions should be installed and upgraded as part of the release. If set to `false`, the CRDs will only be installed if they do not already exist. | `true` |
| `crds.keep`    | Indicates if Custom Resource Definitions should be kept when a release is uninstalled.                                                                                             | `true` |

### Global Parameters

| Name                     | Description                                                                | Value |
| ------------------------ | -------------------------------------------------------------------------- | ----- |
| `global.env`             | Environment variables to add to all orray pods.                            | `[]`  |
| `global.envFrom`         | Environment variables to add to all orray pods from ConfigMaps or Secrets. | `[]`  |
| `global.nodeSelector`    | Default node selector for all orray pods.                                  | `{}`  |
| `global.labels`          | Labels to add to all resources.                                            | `{}`  |
| `global.annotations`     | Annotations to add to all resources.                                       | `{}`  |
| `global.podLabels`       | Labels to add to all pods.                                                 | `{}`  |
| `global.podAnnotations`  | Annotations to add to pods.                                                | `{}`  |
| `global.tolerations`     | Default tolerations for all orray pods.                                    | `[]`  |
| `global.affinity`        | Default affinity for all orray pods.                                       | `{}`  |
| `global.securityContext` | Default security context for all orray pods.                               | `{}`  |

### Controller

| Name                                                        | Description                                                                                                                                                               | Value     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `controller.enabled`                                        | Whether the controller is enabled.                                                                                                                                        | `true`    |
| `controller.labels`                                         | Labels to add to the api resources. Merges with `global.labels`, allowing you to override or add to the global labels.                                                    | `{}`      |
| `controller.annotations`                                    | Annotations to add to the api resources. Merges with `global.annotations`, allowing you to override or add to the global annotations.                                     | `{}`      |
| `controller.podLabels`                                      | Optional labels to add to pods. Merges with `global.podLabels`, allowing you to override or add to the global labels.                                                     | `{}`      |
| `controller.podAnnotations`                                 | Optional annotations to add to pods. Merges with `global.podAnnotations`, allowing you to override or add to the global annotations.                                      | `{}`      |
| `controller.serviceAccount.clusterWideSecretReadingEnabled` | Specifies whether the controller's ServiceAccount should be granted read permissions to Secrets CLUSTER-WIDE in the orray control plane's cluster.                        | `true`    |
| `controller.reconcilers.maxConcurrentReconciles`            | specifies the maximum number of resources EACH of the controller's reconcilers can reconcile concurrently. This setting may also be overridden on a per-reconciler basis. | `4`       |
| `controller.securityContext`                                | Security context for controller pods. Defaults to `global.securityContext`.                                                                                               | `{}`      |
| `controller.logLevel`                                       | The log level for the controller.                                                                                                                                         | `INFO`    |
| `controller.logFormat`                                      | The log format for the controller. Available options: console, json. Defaults to 'console'.                                                                               | `console` |
| `controller.resources`                                      | Resources limits and requests for the controller containers.                                                                                                              | `{}`      |
| `controller.nodeSelector`                                   | Node selector for controller pods. Defaults to `global.nodeSelector`.                                                                                                     | `{}`      |
| `controller.tolerations`                                    | Tolerations for controller pods. Defaults to `global.tolerations`.                                                                                                        | `[]`      |
| `controller.affinity`                                       | Specifies pod affinity for controller pods. Defaults to `global.affinity`.                                                                                                | `{}`      |
| `controller.env`                                            | Environment variables to add to controller pods.                                                                                                                          | `[]`      |
| `controller.envFrom`                                        | Environment variables to add to controller pods from ConfigMaps or Secrets.                                                                                               | `[]`      |

### RBAC

| Name                              | Description                                             | Value  |
| --------------------------------- | ------------------------------------------------------- | ------ |
| `rbac.installClusterRoles`        | Indicates if `ClusterRoles` should be installed.        | `true` |
| `rbac.installClusterRoleBindings` | Indicates if `ClusterRoleBindings` should be installed. | `true` |

### Webhooks

| Name                | Description                                                                                      | Value  |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| `webhooks.register` | Whether to create `ValidatingWebhookConfiguration` and `MutatingWebhookConfiguration` resources. | `true` |

### Webhooks Server

| Name                                | Description                                                                                                                                                                                                                                                                                                                                                                           | Value     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `webhooksServer.enabled`            | Whether the webhooks server is enabled.                                                                                                                                                                                                                                                                                                                                               | `true`    |
| `webhooksServer.replicas`           | The number of webhooks server pods.                                                                                                                                                                                                                                                                                                                                                   | `1`       |
| `webhooksServer.logLevel`           | The log level for the webhooks server.                                                                                                                                                                                                                                                                                                                                                | `INFO`    |
| `webhooksServer.logFormat`          | The log format for the webhooks server. Available options: console, json. Defaults to 'console'.                                                                                                                                                                                                                                                                                      | `console` |
| `webhooksServer.labels`             | Labels to add to the api resources. Merges with `global.labels`, allowing you to override or add to the global labels.                                                                                                                                                                                                                                                                | `{}`      |
| `webhooksServer.annotations`        | Annotations to add to the api resources. Merges with `global.annotations`, allowing you to override or add to the global annotations.                                                                                                                                                                                                                                                 | `{}`      |
| `webhooksServer.podLabels`          | Optional labels to add to pods. Merges with `global.podLabels`, allowing you to override or add to the global labels.                                                                                                                                                                                                                                                                 | `{}`      |
| `webhooksServer.podAnnotations`     | Optional annotations to add to pods. Merges with `global.podAnnotations`, allowing you to override or add to the global annotations.                                                                                                                                                                                                                                                  | `{}`      |
| `webhooksServer.resources`          | Resources limits and requests for the webhooks server containers.                                                                                                                                                                                                                                                                                                                     | `{}`      |
| `webhooksServer.tls.selfSignedCert` | Whether to generate a self-signed certificate for the controller's built-in webhook server. If `true`, `cert-manager` CRDs **must** be present in the cluster. Orray will create and use its own namespaced issuer. If `false`, a cert secret named `orray-webhooks-server-cert` **must** be provided in the same namespace as Kargo. There is no provision for webhooks without TLS. | `true`    |
| `webhooksServer.nodeSelector`       | Node selector for the webhooks server pods. Defaults to `global.nodeSelector`.                                                                                                                                                                                                                                                                                                        | `{}`      |
| `webhooksServer.tolerations`        | Tolerations for the webhooks server pods. Defaults to `global.tolerations`.                                                                                                                                                                                                                                                                                                           | `[]`      |
| `webhooksServer.affinity`           | Specifies pod affinity for the webhooks server pods. Defaults to `global.affinity`.                                                                                                                                                                                                                                                                                                   | `{}`      |
| `webhooksServer.securityContext`    | Security context for webhooks server pods. Defaults to `global.securityContext`.                                                                                                                                                                                                                                                                                                      | `{}`      |
| `webhooksServer.env`                | Environment variables to add to webhook server pods.                                                                                                                                                                                                                                                                                                                                  | `[]`      |
| `webhooksServer.envFrom`            | Environment variables to add to webhook server pods from ConfigMaps or Secrets.                                                                                                                                                                                                                                                                                                       | `[]`      |
