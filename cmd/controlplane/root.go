package main

import (
	"context"

	"github.com/spf13/cobra"
)

// RootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "orray",
	Short: "Orray control plane services",
	Long:  `Orray control plane services for running on Kubernetes.`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the RootCmd.
func Execute(ctx context.Context) error {
	rootCmd.AddCommand(newControllerCommand())
	rootCmd.AddCommand(newKubernetesWebhooksServerCommand())
	return rootCmd.ExecuteContext(ctx)
}
