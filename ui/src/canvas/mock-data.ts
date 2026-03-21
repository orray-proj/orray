import type { CanvasEdge, CanvasNode } from "./types";

const nodes: CanvasNode[] = [
  // --- Ingress layer ---
  {
    id: "ingress-gateway",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "ingress-gateway",
      kind: "Deployment",
      namespace: "ingress",
      replicas: { ready: 2, desired: 2 },
      health: "healthy",
    },
  },

  // --- Service layer ---
  {
    id: "api-server",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "api-server",
      kind: "Deployment",
      namespace: "production",
      replicas: { ready: 3, desired: 3 },
      health: "healthy",
    },
  },
  {
    id: "auth-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "auth-service",
      kind: "Deployment",
      namespace: "production",
      replicas: { ready: 2, desired: 2 },
      health: "healthy",
    },
  },
  {
    id: "order-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "order-service",
      kind: "StatefulSet",
      namespace: "production",
      replicas: { ready: 3, desired: 3 },
      health: "healthy",
    },
  },
  {
    id: "payment-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "payment-service",
      kind: "Deployment",
      namespace: "production",
      replicas: { ready: 2, desired: 2 },
      health: "degraded",
    },
  },
  {
    id: "notification-service",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "notification-service",
      kind: "Deployment",
      namespace: "production",
      replicas: { ready: 1, desired: 2 },
      health: "unhealthy",
    },
  },

  // --- Worker layer ---
  {
    id: "email-worker",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "email-worker",
      kind: "Job",
      namespace: "production",
      replicas: { ready: 1, desired: 1 },
      health: "healthy",
    },
  },
  {
    id: "report-generator",
    type: "component",
    position: { x: 0, y: 0 },
    data: {
      label: "report-generator",
      kind: "CronJob",
      namespace: "production",
      replicas: { ready: 0, desired: 0 },
      health: "unknown",
    },
  },

  // --- Resource layer ---
  {
    id: "postgres-primary",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      label: "postgres-primary",
      kind: "Database",
      provider: "PostgreSQL",
      health: "healthy",
    },
  },
  {
    id: "redis-cache",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      label: "redis-cache",
      kind: "Cache",
      provider: "Redis",
      health: "healthy",
    },
  },
  {
    id: "rabbitmq",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      label: "rabbitmq",
      kind: "Queue",
      provider: "RabbitMQ",
      health: "degraded",
    },
  },
  {
    id: "s3-storage",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      label: "s3-storage",
      kind: "Storage",
      provider: "S3",
      health: "healthy",
    },
  },
  {
    id: "stripe-api",
    type: "resource",
    position: { x: 0, y: 0 },
    data: {
      label: "stripe-api",
      kind: "ExternalService",
      provider: "Stripe",
      health: "healthy",
    },
  },
];

const edges: CanvasEdge[] = [
  // Ingress → services
  {
    id: "e-ingress-api",
    source: "ingress-gateway",
    target: "api-server",
    type: "active",
    data: { status: "active", protocol: "HTTP", rps: 1200 },
  },
  {
    id: "e-ingress-auth",
    source: "ingress-gateway",
    target: "auth-service",
    type: "active",
    data: { status: "active", protocol: "HTTP", rps: 400 },
  },

  // api-server → downstream
  {
    id: "e-api-auth",
    source: "api-server",
    target: "auth-service",
    type: "active",
    data: { status: "active", protocol: "gRPC", rps: 800 },
  },
  {
    id: "e-api-order",
    source: "api-server",
    target: "order-service",
    type: "active",
    data: { status: "active", protocol: "gRPC", rps: 350 },
  },
  {
    id: "e-api-redis",
    source: "api-server",
    target: "redis-cache",
    type: "active",
    data: { status: "active", protocol: "TCP", rps: 2000 },
  },

  // order-service → data
  {
    id: "e-order-pg",
    source: "order-service",
    target: "postgres-primary",
    type: "active",
    data: { status: "active", protocol: "TCP", rps: 600 },
  },
  {
    id: "e-order-rabbit",
    source: "order-service",
    target: "rabbitmq",
    type: "active",
    data: { status: "active", protocol: "AMQP", rps: 150 },
  },

  // payment-service
  {
    id: "e-payment-stripe",
    source: "payment-service",
    target: "stripe-api",
    type: "active",
    data: {
      status: "active",
      protocol: "HTTPS",
      rps: 80,
      latencyP99: 450,
    },
  },
  {
    id: "e-payment-pg",
    source: "payment-service",
    target: "postgres-primary",
    type: "active",
    data: { status: "active", protocol: "TCP", rps: 200 },
  },
  {
    id: "e-api-payment",
    source: "api-server",
    target: "payment-service",
    type: "active",
    data: { status: "active", protocol: "gRPC", rps: 120 },
  },

  // notification-service — error edge to rabbitmq
  {
    id: "e-notif-rabbit",
    source: "notification-service",
    target: "rabbitmq",
    type: "error",
    data: {
      status: "error",
      protocol: "AMQP",
      errorRate: 0.42,
    },
  },
  {
    id: "e-notif-email",
    source: "notification-service",
    target: "email-worker",
    type: "idle",
    data: { status: "idle", protocol: "internal" },
  },

  // Workers → resources
  {
    id: "e-email-s3",
    source: "email-worker",
    target: "s3-storage",
    type: "idle",
    data: { status: "idle", protocol: "HTTPS" },
  },
  {
    id: "e-report-pg",
    source: "report-generator",
    target: "postgres-primary",
    type: "active",
    data: { status: "active", protocol: "TCP", rps: 30 },
  },
  {
    id: "e-report-s3",
    source: "report-generator",
    target: "s3-storage",
    type: "active",
    data: { status: "active", protocol: "HTTPS", rps: 10 },
  },
];

export function createMockTopology(): {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  return { nodes, edges };
}
