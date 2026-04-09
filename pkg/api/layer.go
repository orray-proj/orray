package api

import (
	"context"
	"fmt"

	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// LayerService provides methods to interact with Layer resources.
type LayerService interface {
	Create(ctx context.Context, namespace, name string, spec orrayv1alpha1.LayerSpec) (*orrayv1alpha1.Layer, error)
	List(ctx context.Context, namespace string) (*orrayv1alpha1.LayerList, error)
	GetByID(ctx context.Context, id string) (*orrayv1alpha1.Layer, error)
}

type layerService struct {
	kubeClient client.Client
}

// NewLayerService creates a new LayerService.
func NewLayerService(kubeClient client.Client) LayerService {
	return &layerService{
		kubeClient: kubeClient,
	}
}

// Create creates a new Layer resource in the specified namespace.
func (s *layerService) Create(ctx context.Context, namespace, name string, spec orrayv1alpha1.LayerSpec) (*orrayv1alpha1.Layer, error) {
	layer := &orrayv1alpha1.Layer{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		Spec: spec,
	}

	if err := s.kubeClient.Create(ctx, layer); err != nil {
		return nil, err
	}

	return layer, nil
}

// List lists all Layer resources in a specific namespace.
func (s *layerService) List(ctx context.Context, namespace string) (*orrayv1alpha1.LayerList, error) {
	list := &orrayv1alpha1.LayerList{}
	if err := s.kubeClient.List(ctx, list, client.InNamespace(namespace)); err != nil {
		return nil, err
	}
	return list, nil
}

// GetByID retrieves a Layer resource by ID (UID).
func (s *layerService) GetByID(ctx context.Context, id string) (*orrayv1alpha1.Layer, error) {
	list := &orrayv1alpha1.LayerList{}
	if err := s.kubeClient.List(ctx, list, client.MatchingFields{"metadata.uid": id}); err != nil {
		return nil, err
	}

	if len(list.Items) == 0 {
		return nil, fmt.Errorf("layer not found with id %s", id)
	}

	return &list.Items[0], nil
}
