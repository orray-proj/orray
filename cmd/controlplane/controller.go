package main

import (
	"context"
	"fmt"
	stdruntime "runtime"
	"sync"

	batchv1 "k8s.io/api/batch/v1"
	coordinationv1 "k8s.io/api/coordination/v1"
	corev1 "k8s.io/api/core/v1"
	ctrl "sigs.k8s.io/controller-runtime"

	"github.com/orray-proj/orray/pkg/kubernetes"
	versionpkg "github.com/orray-proj/orray/pkg/version"
	"github.com/spf13/cobra"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/metrics/server"
)

type controller struct {
	baseComponent
}

func newControllerCommand() *cobra.Command {
	ctrl := &controller{}
	if err := ctrl.Bootstrap(); err != nil {
		panic(err)
	}

	cmd := &cobra.Command{
		Use:               "controller",
		Short:             "Run the Orray controller manager",
		DisableAutoGenTag: true,
		SilenceErrors:     true,
		SilenceUsage:      true,
		RunE: func(cmd *cobra.Command, _ []string) error {
			version := versionpkg.GetVersion()
			startupLogger := ctrl.Logger.WithValues(
				"version", version.Version,
				"commit", version.GitCommit,
				"GOMAXPROCS", stdruntime.GOMAXPROCS(0),
			)

			startupLogger.Info("Starting Orray Controller")

			return ctrl.run(cmd.Context())
		},
	}

	return cmd
}

// run runs the controller
func (c *controller) run(ctx context.Context) error {
	mgr, err := c.setupControllerManager(ctx)
	if err != nil {
		return fmt.Errorf("failed to setup orray controller manager: %w", err)
	}

	// TODO: setup reconcilers
	return startControllerManager(ctx, mgr)
}

// setupControllerManager sets up the controller manager.
func (c *controller) setupControllerManager(_ context.Context) (manager.Manager, error) {
	logger := c.Logger

	logger.Debug("loading in-cluster REST config")
	restCfg, err := kubernetes.NewInClusterConfig()
	if err != nil {
		return nil, fmt.Errorf("error loading in-cluster REST config: %w", err)
	}

	scheme := runtime.NewScheme()
	if err = corev1.AddToScheme(scheme); err != nil {
		return nil, fmt.Errorf(
			"error adding Kubernetes core API to controller manager scheme: %w",
			err,
		)
	}
	if err = batchv1.AddToScheme(scheme); err != nil {
		return nil, fmt.Errorf(
			"error adding Kubernetes batch API to controller manager scheme: %w",
			err,
		)
	}

	if err = coordinationv1.AddToScheme(scheme); err != nil {
		return nil, fmt.Errorf(
			"error adding Kubernetes coordination API to controller manager scheme: %w",
			err,
		)
	}

	mgr, err := ctrl.NewManager(restCfg, ctrl.Options{
		Scheme: scheme,
		Metrics: server.Options{
			BindAddress: "0",
		},
		PprofBindAddress: c.Config.PprofBindAddress,
		Client: client.Options{
			Cache: &client.CacheOptions{
				DisableFor: []client.Object{&corev1.Secret{}},
			},
		},
		// Add leader election configuration
		LeaderElection:          true,
		LeaderElectionNamespace: "orray-system",
		LeaderElectionID:        "orray-controller",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create controller manager: %w", err)
	}

	// TODO: add indexer
	return mgr, nil
}

// startControllerManager starts the controller manager.
func startControllerManager(ctx context.Context, mgr manager.Manager) error {
	var (
		errChan = make(chan error)
		wg      sync.WaitGroup
	)

	wg.Go(func() {
		if err := mgr.Start(ctx); err != nil {
			errChan <- fmt.Errorf("failed to start controller manager: %w", err)
		}
	})

	// Adapt wg to a channel that can be used in a select
	doneCh := make(chan struct{})
	go func() {
		wg.Wait()
		close(doneCh)
	}()

	select {
	case err := <-errChan:
		return err
	case <-doneCh:
		return nil
	}
}
