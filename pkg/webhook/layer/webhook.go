package layer

import (
	"context"
	"fmt"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/webhook/admission"
)

// LayerWebhook implements the Defaulter and Validator interfaces.
type LayerWebhook struct {
	Client client.Client
	Logger *logging.Logger
}

// NewLayerWebhook returns a new LayerWebhook.
func NewLayerWebhook(cli client.Client, logger *logging.Logger) *LayerWebhook {
	return &LayerWebhook{
		Client: cli,
		Logger: logger,
	}
}

// SetupWebhookWithManager sets up the webhook with the Manager.
func (w *LayerWebhook) SetupWebhookWithManager(mgr ctrl.Manager) error {
	return ctrl.NewWebhookManagedBy(mgr, &v1alpha1.Layer{}).
		WithDefaulter(w).
		WithValidator(w).
		Complete()
}

// Default implements admission.CustomDefaulter so a webhook will be registered for the type
func (w *LayerWebhook) Default(ctx context.Context, layer *v1alpha1.Layer) error {
	w.Logger.Debug("defaulting layer", "name", layer.Name, "namespace", layer.Namespace)
	return nil
}

// ValidateCreate implements admission.CustomValidator so a webhook will be registered for the type
func (w *LayerWebhook) ValidateCreate(ctx context.Context, layer *v1alpha1.Layer) (admission.Warnings, error) {
	w.Logger.Debug("validate create layer", "name", layer.Name, "namespace", layer.Namespace)

	return nil, w.validateLayer(ctx, layer)
}

// ValidateUpdate implements admission.CustomValidator so a webhook will be registered for the type
func (w *LayerWebhook) ValidateUpdate(
	ctx context.Context, oldObj, newObj *v1alpha1.Layer,
) (admission.Warnings, error) {
	w.Logger.Debug("validate update layer", "name", newObj.Name, "namespace", newObj.Namespace)

	return nil, w.validateLayer(ctx, newObj)
}

// ValidateDelete implements admission.CustomValidator so a webhook will be registered for the type
func (w *LayerWebhook) ValidateDelete(ctx context.Context, layer *v1alpha1.Layer) (admission.Warnings, error) {
	return nil, nil
}

func (w *LayerWebhook) validateLayer(ctx context.Context, layer *v1alpha1.Layer) error {
	var ns corev1.Namespace
	if err := w.Client.Get(ctx, types.NamespacedName{Name: layer.Namespace}, &ns); err != nil {
		return fmt.Errorf("failed to get namespace %s: %w", layer.Namespace, err)
	}

	// Check if the namespace has the canvas annotation
	if _, ok := ns.Annotations[v1alpha1.AnnotationCanvas]; ok {
		return nil
	}

	// Also check labels just in case
	if _, ok := ns.Labels[v1alpha1.AnnotationCanvas]; ok {
		return nil
	}

	return fmt.Errorf(
		"namespace %s must be annotated or labeled with %s to create a Layer",
		layer.Namespace,
		v1alpha1.AnnotationCanvas,
	)
}
