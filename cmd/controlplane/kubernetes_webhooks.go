package main

import (
	"context"
	"fmt"
	stdruntime "runtime"

	authzv1 "k8s.io/api/authorization/v1"
	corev1 "k8s.io/api/core/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/healthz"
	"sigs.k8s.io/controller-runtime/pkg/metrics/server"
	"sigs.k8s.io/controller-runtime/pkg/webhook"

	"github.com/orray-proj/orray/pkg/kubernetes"
	versionpkg "github.com/orray-proj/orray/pkg/version"
	"github.com/spf13/cobra"
	"k8s.io/apimachinery/pkg/runtime"
)

type kubernetesWebhooksServer struct {
	*baseComponent
}

func newKubernetesWebhooksServerCommand() *cobra.Command {
	server := &kubernetesWebhooksServer{}
	if err := server.Bootstrap(); err != nil {
		panic(err)
	}

	cmd := &cobra.Command{
		Use:               "kubernetes-webhooks-server",
		DisableAutoGenTag: true,
		SilenceErrors:     true,
		SilenceUsage:      true,
		RunE: func(cmd *cobra.Command, _ []string) error {
			version := versionpkg.GetVersion()
			server.Logger.Info(
				"Starting Orray Kubernetes Webhooks Server",
				"version", version.Version,
				"commit", version.GitCommit,
				"GOMAXPROCS", stdruntime.GOMAXPROCS(0),
			)

			return server.run(cmd.Context())
		},
	}

	return cmd
}

// run starts the webhooks server
func (k *kubernetesWebhooksServer) run(ctx context.Context) error {
	restCfg, err := kubernetes.NewInClusterConfig()
	if err != nil {
		return fmt.Errorf("error loading in-cluster REST config: %w", err)
	}

	scheme := runtime.NewScheme()
	if err = corev1.AddToScheme(scheme); err != nil {
		return fmt.Errorf("add corev1 to scheme: %w", err)
	}
	if err = rbacv1.AddToScheme(scheme); err != nil {
		return fmt.Errorf("add rbacv1 to scheme: %w", err)
	}
	if err = authzv1.AddToScheme(scheme); err != nil {
		return fmt.Errorf("add authzv1 to scheme: %w", err)
	}

	mgr, err := ctrl.NewManager(restCfg, ctrl.Options{
		Scheme: scheme,
		WebhookServer: webhook.NewServer(webhook.Options{
			Port: 9443,
		}),
		Metrics: server.Options{
			BindAddress: k.MetricsBindAddress,
		},
		PprofBindAddress: k.PprofBindAddress,
	})
	if err != nil {
		return fmt.Errorf("error creating manager: %w", err)
	}

	if err := mgr.AddHealthzCheck("healthz", healthz.Ping); err != nil {
		k.Logger.Error(err, "Failed to set up health check")
		return err
	}
	if err := mgr.AddReadyzCheck("readyz", healthz.Ping); err != nil {
		k.Logger.Error(err, "Failed to set up ready check")
		return err
	}

	// indexer := indexer.NewWebhooksServer(mgr)
	// if err := indexer.Index(ctx); err != nil {
	// 	return fmt.Errorf("error indexing webhooks server: %w", err)
	// }

	return k.startWebhooksServer(ctx, mgr)
}

// startWebhooksServer starts the webhooks server.
func (kubernetesWebhooksServer) startWebhooksServer(ctx context.Context, mgr ctrl.Manager) error {
	if err := mgr.Start(ctx); err != nil {
		return fmt.Errorf("error starting orray webhooks server: %w", err)
	}
	return nil
}
