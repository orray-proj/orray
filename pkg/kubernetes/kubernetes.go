package kubernetes

import (
	"fmt"

	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/rest"
)

// NewInClusterConfig creates a new in-cluster REST config with the ContentType set to JSON.
func NewInClusterConfig() (*rest.Config, error) {
	restCfg, err := rest.InClusterConfig()
	if err != nil {
		return nil, fmt.Errorf("error loading in-cluster REST config: %w", err)
	}
	restCfg.ContentType = runtime.ContentTypeJSON
	return restCfg, nil
}
