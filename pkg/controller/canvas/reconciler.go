package canvas

import (
	"context"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	"k8s.io/apimachinery/pkg/api/errors"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// Reconciler reconciles a Canvas object
type Reconciler struct {
	client.Client
	Logger *logging.Logger
}

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := r.Logger.WithValues("canvas", req.NamespacedName)

	canvas := &v1alpha1.Canvas{}
	if err := r.Get(ctx, req.NamespacedName, canvas); err != nil {
		if errors.IsNotFound(err) {
			log.Debug("Canvas resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		log.Error(err, "Failed to get Canvas")
		return ctrl.Result{}, err
	}

	log.Info("Reconciling Canvas", "displayName", canvas.Spec.DisplayName)

	// TODO: Add your reconciliation logic here

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *Reconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.Canvas{}).
		Complete(r)
}
