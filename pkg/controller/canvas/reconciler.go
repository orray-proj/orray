package canvas

import (
	"context"
	"fmt"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
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

	if !canvas.DeletionTimestamp.IsZero() {
		return r.reconcileDelete(ctx, canvas, log)
	}

	if controllerutil.AddFinalizer(canvas, v1alpha1.FinalizerCanvas) {
		if err := r.Update(ctx, canvas); err != nil {
			log.Error(err, "Failed to add finalizer")
			return ctrl.Result{}, err
		}
	}

	// Update status to Provisioning if not already
	if meta.FindStatusCondition(canvas.Status.Conditions, v1alpha1.ConditionTypeReady) == nil {
		meta.SetStatusCondition(&canvas.Status.Conditions, metav1.Condition{
			Type:               v1alpha1.ConditionTypeReady,
			Status:             metav1.ConditionFalse,
			Reason:             v1alpha1.ReasonProvisioning,
			Message:            "Provisioning started",
			ObservedGeneration: canvas.Generation,
		})
		if err := r.Status().Update(ctx, canvas); err != nil {
			log.Error(err, "Failed to update status to Provisioning")
			return ctrl.Result{}, err
		}
	}

	// Sync Namespace
	if err := r.syncNamespace(ctx, canvas, log); err != nil {
		meta.SetStatusCondition(&canvas.Status.Conditions, metav1.Condition{
			Type:               v1alpha1.ConditionTypeReady,
			Status:             metav1.ConditionFalse,
			Reason:             v1alpha1.ReasonFailed,
			Message:            fmt.Sprintf("Failed to sync namespace: %v", err),
			ObservedGeneration: canvas.Generation,
		})
		if statusErr := r.Status().Update(ctx, canvas); statusErr != nil {
			log.Error(statusErr, "Failed to update status to Failed")
		}
		return ctrl.Result{}, err
	}

	// Update status to Ready
	meta.SetStatusCondition(&canvas.Status.Conditions, metav1.Condition{
		Type:               v1alpha1.ConditionTypeReady,
		Status:             metav1.ConditionTrue,
		Reason:             v1alpha1.ReasonProvisioned,
		Message:            "Canvas provisioned successfully",
		ObservedGeneration: canvas.Generation,
	})
	canvas.Status.ObservedGeneration = canvas.Generation

	if err := r.Status().Update(ctx, canvas); err != nil {
		log.Error(err, "Failed to update status to Ready")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

func (r *Reconciler) syncNamespace(ctx context.Context, canvas *v1alpha1.Canvas, log *logging.Logger) error {
	ns := &corev1.Namespace{}
	err := r.Get(ctx, client.ObjectKey{Name: canvas.Name}, ns)
	if err != nil {
		if errors.IsNotFound(err) {
			log.Info("Creating namespace for canvas", "name", canvas.Name)
			ns = &corev1.Namespace{
				ObjectMeta: metav1.ObjectMeta{
					Name: canvas.Name,
					Annotations: map[string]string{
						v1alpha1.AnnotationCanvas:    "true",
						v1alpha1.AnnotationManagedBy: v1alpha1.ManagedByValue,
					},
				},
			}
			// Set controller reference so K8s GC deletes it when Canvas is gone
			if err := controllerutil.SetControllerReference(canvas, ns, r.Scheme()); err != nil {
				return err
			}
			return r.Create(ctx, ns)
		}
		return err
	}

	// Namespace exists, ensure annotations are correct
	if ns.Annotations == nil {
		ns.Annotations = make(map[string]string)
	}

	updated := false
	if ns.Annotations[v1alpha1.AnnotationCanvas] != "true" {
		ns.Annotations[v1alpha1.AnnotationCanvas] = "true"
		updated = true
	}
	if ns.Annotations[v1alpha1.AnnotationManagedBy] != v1alpha1.ManagedByValue {
		ns.Annotations[v1alpha1.AnnotationManagedBy] = v1alpha1.ManagedByValue
		updated = true
	}

	if updated {
		log.Info("Updating namespace annotations", "name", canvas.Name)
		return r.Update(ctx, ns)
	}

	return nil
}

func (r *Reconciler) reconcileDelete(ctx context.Context, canvas *v1alpha1.Canvas, log *logging.Logger) (ctrl.Result, error) {
	if !controllerutil.ContainsFinalizer(canvas, v1alpha1.FinalizerCanvas) {
		return ctrl.Result{}, nil
	}

	// Since we set ControllerReference, K8s will handle the deletion of the namespace.
	// If we need custom cleanup before the namespace is gone, we'd do it here.

	controllerutil.RemoveFinalizer(canvas, v1alpha1.FinalizerCanvas)
	if err := r.Update(ctx, canvas); err != nil {
		log.Error(err, "Failed to remove finalizer")
		return ctrl.Result{}, err
	}

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *Reconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.Canvas{}).
		Owns(&corev1.Namespace{}).
		Complete(r)
}
