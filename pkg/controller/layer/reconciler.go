package layer

import (
	"context"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// Reconciler reconciles a Layer object
type Reconciler struct {
	client.Client
	Logger *logging.Logger
}

// SetupWithManager sets up the controller with the Manager.
func (r *Reconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.Layer{}).
		Complete(r)
}

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := r.Logger.WithValues("layer", req.NamespacedName)
	logger.Debug("Reconciling Layer")

	var layer v1alpha1.Layer
	if err := r.Get(ctx, req.NamespacedName, &layer); err != nil {
		if client.IgnoreNotFound(err) != nil {
			logger.Error(err, "unable to fetch Layer")
			return ctrl.Result{}, err
		}
		return ctrl.Result{}, nil
	}

	// For now, the Layer is essentially provisioned upon creation since it's declarative data.
	// You could add further logic to reconcile dependent resources (like actual namespaces) if needed.
	changed := r.updateStatus(&layer)

	if changed {
		if err := r.Status().Update(ctx, &layer); err != nil {
			logger.Error(err, "failed to update Layer status")
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

func (r *Reconciler) updateStatus(layer *v1alpha1.Layer) bool {
	changed := false

	if layer.Status.ObservedGeneration != layer.Generation {
		layer.Status.ObservedGeneration = layer.Generation
		changed = true
	}

	readyCondition := metav1.Condition{
		Type:               v1alpha1.ConditionTypeReady,
		Status:             metav1.ConditionTrue,
		Reason:             v1alpha1.ReasonProvisioned,
		Message:            "Layer is provisioned",
		ObservedGeneration: layer.Generation,
	}

	if meta.SetStatusCondition(&layer.Status.Conditions, readyCondition) {
		changed = true
	}

	return changed
}
