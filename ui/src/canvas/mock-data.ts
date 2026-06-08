import { LAYER_COLORS } from "./layer-colors";
import type { CanvasEdge, CanvasNode } from "./types";

const PROD = "layer:production";
const STAGING = "layer:staging";

const nodes: CanvasNode[] = [
  // --- Ingress layer ---
  // Production + Staging (different health)
  {
    id: "node:ingress-gateway",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "ingress-gateway",
      kind: "gateway",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "ingress",
          health: "healthy",
          labels: { replicas: "2" },
          source: {
            provider: "kubernetes",
            apiVersion: "networking.k8s.io/v1",
            resource: "Ingress",
            namespace: "ingress",
            name: "ingress-gateway",
            uid: "a1",
          },
        },
        [STAGING]: {
          namespace: "ingress-staging",
          health: "healthy",
          labels: { replicas: "1" },
          source: {
            provider: "kubernetes",
            apiVersion: "networking.k8s.io/v1",
            resource: "Ingress",
            namespace: "ingress-staging",
            name: "ingress-gateway",
            uid: "a1s",
          },
        },
      },
    },
  },

  // --- Service layer ---
  // Production + Staging (version diff)
  {
    id: "node:api-server",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "api-server",
      kind: "service",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { replicas: "3", version: "v1.2.0" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "production",
            name: "api-server",
            uid: "b1",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { replicas: "1", version: "v1.3.0-rc2" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "staging",
            name: "api-server",
            uid: "b1s",
          },
        },
      },
    },
  },
  // Production + Staging (health diff)
  {
    id: "node:auth-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "auth-service",
      kind: "service",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { replicas: "2", version: "v3.1.0" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "production",
            name: "auth-service",
            uid: "b2",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "degraded",
          labels: { replicas: "1", version: "v3.2.0-beta" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "staging",
            name: "auth-service",
            uid: "b2s",
          },
        },
      },
    },
  },
  // Production + Staging
  {
    id: "node:order-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "order-service",
      kind: "service",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { replicas: "3", version: "v2.3.1" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "StatefulSet",
            namespace: "production",
            name: "order-service",
            uid: "b3",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { replicas: "1", version: "v2.4.0-rc1" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "StatefulSet",
            namespace: "staging",
            name: "order-service",
            uid: "b3s",
          },
        },
      },
    },
  },
  // Production only — will dim on staging
  {
    id: "node:payment-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "payment-service",
      kind: "service",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "degraded",
          labels: { replicas: "2", version: "v1.8.3" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "production",
            name: "payment-service",
            uid: "b4",
          },
        },
      },
    },
  },
  // Production only — will dim on staging
  {
    id: "node:notification-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "notification-service",
      kind: "service",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "critical",
          labels: { replicas: "1" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "production",
            name: "notification-service",
            uid: "b5",
          },
        },
      },
    },
  },

  // --- Worker layer ---
  // Production + Staging
  {
    id: "node:email-worker",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "email-worker",
      kind: "job",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: {},
          source: {
            provider: "kubernetes",
            apiVersion: "batch/v1",
            resource: "Job",
            namespace: "production",
            name: "email-worker",
            uid: "c1",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: {},
          source: {
            provider: "kubernetes",
            apiVersion: "batch/v1",
            resource: "Job",
            namespace: "staging",
            name: "email-worker",
            uid: "c1s",
          },
        },
      },
    },
  },
  // Production only — will dim on staging
  {
    id: "node:report-generator",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "report-generator",
      kind: "job",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "unknown",
          labels: {},
          source: {
            provider: "kubernetes",
            apiVersion: "batch/v1",
            resource: "CronJob",
            namespace: "production",
            name: "report-generator",
            uid: "c2",
          },
        },
      },
    },
  },

  // --- Resource layer ---
  // Production + Staging (shared infra)
  {
    id: "node:postgres-primary",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      name: "postgres-primary",
      kind: "database",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { provider: "PostgreSQL" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "Service",
            namespace: "production",
            name: "postgres-primary",
            uid: "d1",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { provider: "PostgreSQL" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "Service",
            namespace: "staging",
            name: "postgres-staging",
            uid: "d1s",
          },
        },
      },
    },
  },
  // Production + Staging
  {
    id: "node:redis-cache",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      name: "redis-cache",
      kind: "cache",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { provider: "Redis" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "Service",
            namespace: "production",
            name: "redis-cache",
            uid: "d2",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { provider: "Redis" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "Service",
            namespace: "staging",
            name: "redis-cache",
            uid: "d2s",
          },
        },
      },
    },
  },
  // Production only — will dim on staging
  {
    id: "node:rabbitmq",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      name: "rabbitmq",
      kind: "queue",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "degraded",
          labels: { provider: "RabbitMQ" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "Service",
            namespace: "production",
            name: "rabbitmq",
            uid: "d3",
          },
        },
      },
    },
  },
  // Production + Staging
  {
    id: "node:s3-storage",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      name: "s3-storage",
      kind: "storage",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { provider: "S3" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "PersistentVolumeClaim",
            namespace: "production",
            name: "s3-storage",
            uid: "d4",
          },
        },
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { provider: "S3" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "PersistentVolumeClaim",
            namespace: "staging",
            name: "s3-storage",
            uid: "d4s",
          },
        },
      },
    },
  },
  // Production only
  {
    id: "node:stripe-api",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      name: "stripe-api",
      kind: "external",
      origin: "inferred",
      layers: {
        [PROD]: {
          namespace: "production",
          health: "healthy",
          labels: { provider: "Stripe" },
          source: {
            provider: "kubernetes",
            apiVersion: "v1",
            resource: "Service",
            namespace: "production",
            name: "stripe-api",
            uid: "d5",
          },
        },
      },
    },
  },

  // --- Staging-only nodes (dim on production) ---
  {
    id: "node:feature-flags",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "feature-flags",
      kind: "service",
      origin: "inferred",
      layers: {
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { replicas: "1", version: "v0.2.0" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "staging",
            name: "feature-flags",
            uid: "s1",
          },
        },
      },
    },
  },
  {
    id: "node:debug-proxy",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      name: "debug-proxy",
      kind: "service",
      origin: "inferred",
      layers: {
        [STAGING]: {
          namespace: "staging",
          health: "healthy",
          labels: { replicas: "1", version: "v0.1.0" },
          source: {
            provider: "kubernetes",
            apiVersion: "apps/v1",
            resource: "Deployment",
            namespace: "staging",
            name: "debug-proxy",
            uid: "s2",
          },
        },
      },
    },
  },
];

const edges: CanvasEdge[] = [
  // Ingress -> services (api edges)
  {
    id: "edge:ingress-gateway->api-server:api",
    source: "node:ingress-gateway",
    target: "node:api-server",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "http",
          port: 8080,
          labels: { "inferred-from": "ingress-rule" },
        },
        [STAGING]: {
          protocol: "http",
          port: 8080,
          labels: { "inferred-from": "ingress-rule" },
        },
      },
    },
  },
  {
    id: "edge:ingress-gateway->auth-service:api",
    source: "node:ingress-gateway",
    target: "node:auth-service",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "http",
          port: 8080,
          labels: { "inferred-from": "ingress-rule" },
        },
        [STAGING]: {
          protocol: "http",
          port: 8080,
          labels: { "inferred-from": "ingress-rule" },
        },
      },
    },
  },

  // api-server -> downstream (api edges)
  {
    id: "edge:api-server->auth-service:api",
    source: "node:api-server",
    target: "node:auth-service",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "grpc",
          port: 9090,
          labels: { "inferred-from": "env-var" },
        },
        [STAGING]: {
          protocol: "grpc",
          port: 9090,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:api-server->order-service:api",
    source: "node:api-server",
    target: "node:order-service",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "grpc",
          port: 9090,
          labels: { "inferred-from": "env-var" },
        },
        [STAGING]: {
          protocol: "grpc",
          port: 9090,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:api-server->payment-service:api",
    source: "node:api-server",
    target: "node:payment-service",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "grpc",
          port: 9090,
          labels: { "inferred-from": "service-selector" },
        },
      },
    },
  },

  // Component -> Resource (dependency edges)
  {
    id: "edge:api-server->redis-cache:dependency",
    source: "node:api-server",
    target: "node:redis-cache",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "tcp",
          port: 6379,
          labels: { "inferred-from": "env-var" },
        },
        [STAGING]: {
          protocol: "tcp",
          port: 6379,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:order-service->postgres-primary:dependency",
    source: "node:order-service",
    target: "node:postgres-primary",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "tcp",
          port: 5432,
          labels: { "inferred-from": "env-var" },
        },
        [STAGING]: {
          protocol: "tcp",
          port: 5432,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:payment-service->postgres-primary:dependency",
    source: "node:payment-service",
    target: "node:postgres-primary",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "tcp",
          port: 5432,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:payment-service->stripe-api:dependency",
    source: "node:payment-service",
    target: "node:stripe-api",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "https",
          port: 443,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:report-generator->postgres-primary:dependency",
    source: "node:report-generator",
    target: "node:postgres-primary",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "tcp",
          port: 5432,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:report-generator->s3-storage:dependency",
    source: "node:report-generator",
    target: "node:s3-storage",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "https",
          port: 443,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:email-worker->s3-storage:dependency",
    source: "node:email-worker",
    target: "node:s3-storage",
    type: "dependency",
    data: {
      kind: "dependency",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "https",
          port: 443,
          labels: { "inferred-from": "env-var" },
        },
        [STAGING]: {
          protocol: "https",
          port: 443,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },

  // Async event edges (via queue)
  {
    id: "edge:order-service->rabbitmq:event",
    source: "node:order-service",
    target: "node:rabbitmq",
    type: "event",
    data: {
      kind: "event",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "amqp",
          port: 5672,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:notification-service->rabbitmq:event",
    source: "node:notification-service",
    target: "node:rabbitmq",
    type: "event",
    data: {
      kind: "event",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "amqp",
          port: 5672,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:notification-service->email-worker:event",
    source: "node:notification-service",
    target: "node:email-worker",
    type: "event",
    data: {
      kind: "event",
      origin: "inferred",
      layers: {
        [PROD]: {
          protocol: "internal",
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },

  // Staging-only edges
  {
    id: "edge:api-server->feature-flags:api",
    source: "node:api-server",
    target: "node:feature-flags",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [STAGING]: {
          protocol: "http",
          port: 8080,
          labels: { "inferred-from": "env-var" },
        },
      },
    },
  },
  {
    id: "edge:ingress-gateway->debug-proxy:api",
    source: "node:ingress-gateway",
    target: "node:debug-proxy",
    type: "api",
    data: {
      kind: "api",
      origin: "inferred",
      layers: {
        [STAGING]: {
          protocol: "http",
          port: 9090,
          labels: { "inferred-from": "ingress-rule" },
        },
      },
    },
  },
];

/** Layer metadata used by the layer switcher. */
export const MOCK_LAYERS = [
  { id: PROD, name: "Production", color: LAYER_COLORS[2] },
  { id: STAGING, name: "Staging", color: LAYER_COLORS[1] },
] as const;

export function createMockTopology(): {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  return { nodes, edges };
}
