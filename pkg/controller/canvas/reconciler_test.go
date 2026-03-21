package canvas

import (
	"context"
	"testing"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestReconcile(t *testing.T) {
	scheme := runtime.NewScheme()
	require.NoError(t, v1alpha1.AddToScheme(scheme))
	require.NoError(t, corev1.AddToScheme(scheme))

	logger, _ := logging.NewLogger(logging.DebugLevel, logging.ConsoleFormat)

	t.Run("CanvasNotFound", func(t *testing.T) {
		cl := fake.NewClientBuilder().WithScheme(scheme).Build()
		r := &Reconciler{Client: cl, Logger: logger}

		req := ctrl.Request{
			NamespacedName: types.NamespacedName{
				Name: "non-existent",
			},
		}

		res, err := r.Reconcile(context.Background(), req)
		assert.NoError(t, err)
		assert.Equal(t, ctrl.Result{}, res)
	})

	t.Run("NewCanvas", func(t *testing.T) {
		canvas := &v1alpha1.Canvas{
			ObjectMeta: metav1.ObjectMeta{
				Name: "test-canvas",
			},
			Spec: v1alpha1.CanvasSpec{
				DisplayName: "Test Canvas",
			},
		}

		cl := fake.NewClientBuilder().
			WithScheme(scheme).
			WithRuntimeObjects(canvas).
			WithStatusSubresource(canvas).
			Build()
		r := &Reconciler{Client: cl, Logger: logger}

		req := ctrl.Request{
			NamespacedName: types.NamespacedName{
				Name: "test-canvas",
			},
		}

		// First reconcile: adds finalizer and status provisioning
		res, err := r.Reconcile(context.Background(), req)
		assert.NoError(t, err)
		assert.Equal(t, ctrl.Result{}, res)

		// Second reconcile (due to update): syncs namespace and sets status ready
		res, err = r.Reconcile(context.Background(), req)
		assert.NoError(t, err)
		assert.Equal(t, ctrl.Result{}, res)

		// Check Canvas finalizer and status
		updatedCanvas := &v1alpha1.Canvas{}
		err = cl.Get(context.Background(), req.NamespacedName, updatedCanvas)
		assert.NoError(t, err)
		assert.Contains(t, updatedCanvas.Finalizers, v1alpha1.FinalizerCanvas)

		readyCond := meta.FindStatusCondition(updatedCanvas.Status.Conditions, v1alpha1.ConditionTypeReady)
		assert.NotNil(t, readyCond)
		assert.Equal(t, metav1.ConditionTrue, readyCond.Status)
		assert.Equal(t, v1alpha1.ReasonProvisioned, readyCond.Reason)

		// Check Namespace creation
		ns := &corev1.Namespace{}
		err = cl.Get(context.Background(), types.NamespacedName{Name: "test-canvas"}, ns)
		assert.NoError(t, err)
		assert.Equal(t, "true", ns.Annotations[v1alpha1.AnnotationCanvas])
		assert.Equal(t, v1alpha1.ManagedByValue, ns.Annotations[v1alpha1.AnnotationManagedBy])

		// Check OwnerReference
		assert.Len(t, ns.OwnerReferences, 1)
		assert.Equal(t, updatedCanvas.Name, ns.OwnerReferences[0].Name)
	})

	t.Run("UpdateExistingNamespace", func(t *testing.T) {
		canvas := &v1alpha1.Canvas{
			ObjectMeta: metav1.ObjectMeta{
				Name:       "test-canvas",
				Finalizers: []string{v1alpha1.FinalizerCanvas},
			},
			Spec: v1alpha1.CanvasSpec{
				DisplayName: "Test Canvas",
			},
			Status: v1alpha1.CanvasStatus{
				Conditions: []metav1.Condition{
					{
						Type:               v1alpha1.ConditionTypeReady,
						Status:             metav1.ConditionTrue,
						Reason:             v1alpha1.ReasonProvisioned,
						Message:            "Canvas provisioned successfully",
						ObservedGeneration: 0,
					},
				},
			},
		}

		ns := &corev1.Namespace{
			ObjectMeta: metav1.ObjectMeta{
				Name: "test-canvas",
				// Missing annotations
			},
		}

		cl := fake.NewClientBuilder().
			WithScheme(scheme).
			WithRuntimeObjects(canvas, ns).
			WithStatusSubresource(canvas).
			Build()
		r := &Reconciler{Client: cl, Logger: logger}

		req := ctrl.Request{
			NamespacedName: types.NamespacedName{
				Name: "test-canvas",
			},
		}

		res, err := r.Reconcile(context.Background(), req)
		assert.NoError(t, err)
		assert.Equal(t, ctrl.Result{}, res)

		// Check Namespace annotations updated
		updatedNS := &corev1.Namespace{}
		err = cl.Get(context.Background(), types.NamespacedName{Name: "test-canvas"}, updatedNS)
		assert.NoError(t, err)
		assert.Equal(t, "true", updatedNS.Annotations[v1alpha1.AnnotationCanvas])
		assert.Equal(t, v1alpha1.ManagedByValue, updatedNS.Annotations[v1alpha1.AnnotationManagedBy])
	})

	t.Run("DeleteCanvas", func(t *testing.T) {
		now := metav1.Now()
		canvas := &v1alpha1.Canvas{
			ObjectMeta: metav1.ObjectMeta{
				Name:              "test-canvas",
				Finalizers:        []string{v1alpha1.FinalizerCanvas},
				DeletionTimestamp: &now,
			},
		}

		cl := fake.NewClientBuilder().
			WithScheme(scheme).
			WithRuntimeObjects(canvas).
			Build()
		r := &Reconciler{Client: cl, Logger: logger}

		req := ctrl.Request{
			NamespacedName: types.NamespacedName{
				Name: "test-canvas",
			},
		}

		res, err := r.Reconcile(context.Background(), req)
		assert.NoError(t, err)
		assert.Equal(t, ctrl.Result{}, res)

		// Check Canvas is gone (since it had deletion timestamp and we removed the last finalizer)
		updatedCanvas := &v1alpha1.Canvas{}
		err = cl.Get(context.Background(), req.NamespacedName, updatedCanvas)
		assert.Error(t, err)
		assert.True(t, errors.IsNotFound(err))
	})
}
