package api

import (
	"context"

	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// CanvasService provides methods to interact with Canvas resources.
type CanvasService interface {
	Create(ctx context.Context, name, displayName string) (*orrayv1alpha1.Canvas, error)
	List(ctx context.Context) (*orrayv1alpha1.CanvasList, error)
	Get(ctx context.Context, name string) (*orrayv1alpha1.Canvas, error)
	GetByID(ctx context.Context, id string) (*orrayv1alpha1.Canvas, error)
	Delete(ctx context.Context, name string) error
}

type canvasService struct {
	kubeClient client.Client
}

// NewCanvasService creates a new CanvasService.
func NewCanvasService(kubeClient client.Client) CanvasService {
	return &canvasService{
		kubeClient: kubeClient,
	}
}

// Create creates a new Canvas resource.
func (s *canvasService) Create(ctx context.Context, name, displayName string) (*orrayv1alpha1.Canvas, error) {
	canvas := &orrayv1alpha1.Canvas{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Spec: orrayv1alpha1.CanvasSpec{
			DisplayName: displayName,
		},
	}

	if err := s.kubeClient.Create(ctx, canvas); err != nil {
		return nil, err
	}

	return canvas, nil
}

// List lists all Canvas resources.
func (s *canvasService) List(ctx context.Context) (*orrayv1alpha1.CanvasList, error) {
	list := &orrayv1alpha1.CanvasList{}
	if err := s.kubeClient.List(ctx, list); err != nil {
		return nil, err
	}
	return list, nil
}

// Get retrieves a Canvas resource by name.
func (s *canvasService) Get(ctx context.Context, name string) (*orrayv1alpha1.Canvas, error) {
	canvas := &orrayv1alpha1.Canvas{}
	if err := s.kubeClient.Get(ctx, client.ObjectKey{Name: name}, canvas); err != nil {
		return nil, err
	}
	return canvas, nil
}

// GetByID retrieves a Canvas resource by ID (UID).
func (s *canvasService) GetByID(ctx context.Context, id string) (*orrayv1alpha1.Canvas, error) {
	list := &orrayv1alpha1.CanvasList{}
	if err := s.kubeClient.List(ctx, list, client.MatchingFields{"metadata.uid": id}); err != nil {
		return nil, err
	}

	if len(list.Items) == 0 {
		return nil, apierrors.NewNotFound(
			schema.GroupResource{
				Group:    orrayv1alpha1.GroupVersion.Group,
				Resource: "canvases",
			},
			id,
		)
	}

	return &list.Items[0], nil
}

// Delete deletes a Canvas resource by name.
func (s *canvasService) Delete(ctx context.Context, name string) error {
	canvas := &orrayv1alpha1.Canvas{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
	}
	return s.kubeClient.Delete(ctx, canvas)
}
