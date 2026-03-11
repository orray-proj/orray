package canvas

import (
	"context"
	"fmt"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/webhook/admission"
)

// CanvasWebhook implements the Defaulter and Validator interfaces.
type CanvasWebhook struct {
	Logger *logging.Logger
}

// NewCanvasWebhook returns a new CanvasWebhook.
func NewCanvasWebhook(logger *logging.Logger) *CanvasWebhook {
	return &CanvasWebhook{
		Logger: logger,
	}
}

// SetupWebhookWithManager sets up the webhook with the Manager.
func (w *CanvasWebhook) SetupWebhookWithManager(mgr ctrl.Manager) error {
	return ctrl.NewWebhookManagedBy(mgr, &v1alpha1.Canvas{}).
		WithDefaulter(w).
		WithValidator(w).
		Complete()
}

// Default implements admission.CustomDefaulter so a webhook will be registered for the type
func (w *CanvasWebhook) Default(ctx context.Context, canvas *v1alpha1.Canvas) error {
	w.Logger.Debug("defaulting canvas", "name", canvas.Name)

	if canvas.Spec.DisplayName == "" {
		canvas.Spec.DisplayName = canvas.Name
	}

	return nil
}

// ValidateCreate implements admission.CustomValidator so a webhook will be registered for the type
func (w *CanvasWebhook) ValidateCreate(ctx context.Context, canvas *v1alpha1.Canvas) (admission.Warnings, error) {
	w.Logger.Debug("validate create canvas", "name", canvas.Name)

	return nil, w.validateCanvas(canvas)
}

// ValidateUpdate implements admission.CustomValidator so a webhook will be registered for the type
func (w *CanvasWebhook) ValidateUpdate(
	ctx context.Context, oldObj, newObj *v1alpha1.Canvas,
) (admission.Warnings, error) {
	w.Logger.Debug("validate update canvas", "name", newObj.Name)

	return nil, w.validateCanvas(newObj)
}

// ValidateDelete implements admission.CustomValidator so a webhook will be registered for the type
func (w *CanvasWebhook) ValidateDelete(ctx context.Context, canvas *v1alpha1.Canvas) (admission.Warnings, error) {
	return nil, nil
}

func (w *CanvasWebhook) validateCanvas(canvas *v1alpha1.Canvas) error {
	if canvas.Spec.DisplayName == "" {
		return fmt.Errorf("spec.displayName is required")
	}
	return nil
}
