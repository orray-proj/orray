package main

import (
	"context"
	"fmt"

	"github.com/orray-proj/orray/pkg/kubernetes"
	"github.com/orray-proj/orray/pkg/rest"
	versionpkg "github.com/orray-proj/orray/pkg/version"
	"github.com/spf13/cobra"
	stdkubernetes "k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type apiServer struct {
	*baseComponent
}

func newAPIServerCommand() *cobra.Command {
	s := &apiServer{
		baseComponent: newBaseComponent(),
	}

	cmd := &cobra.Command{
		Use:               "apiserver",
		Short:             "Run the Orray API server",
		DisableAutoGenTag: true,
		SilenceErrors:     true,
		SilenceUsage:      true,
		RunE: func(cmd *cobra.Command, _ []string) error {
			version := versionpkg.GetVersion()
			startupLogger := s.Logger.WithValues(
				"version", version.Version,
				"commit", version.GitCommit,
			)

			startupLogger.Info("Starting Orray API Server")

			return s.run(cmd.Context())
		},
	}

	return cmd
}

func (s *apiServer) run(ctx context.Context) error {
	restCfg, err := kubernetes.NewInClusterConfig()
	if err != nil {
		return fmt.Errorf("error loading in-cluster REST config: %w", err)
	}

	kubeClient, err := client.New(restCfg, client.Options{})
	if err != nil {
		return fmt.Errorf("failed to create kubernetes client: %w", err)
	}

	clientset, err := stdkubernetes.NewForConfig(restCfg)
	if err != nil {
		return fmt.Errorf("failed to create kubernetes clientset: %w", err)
	}

	cfg := new(rest.Config)
	if err := rest.NewConfig(cfg, *s.Config); err != nil {
		return err
	}
	server := rest.NewServer(ctx, cfg, s.Logger, kubeClient, clientset)

	return server.Run(ctx.Done())
}
