package layer

import (
	"context"
	"testing"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestReconciler_Reconcile(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = v1alpha1.AddToScheme(scheme)

	logger, _ := logging.NewLogger(logging.DebugLevel, logging.JSONFormat)

	layer := &v1alpha1.Layer{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-layer",
			Namespace: "test-ns",
		},
	}

	fakeClient := fake.NewClientBuilder().
		WithScheme(scheme).
		WithObjects(layer).
		WithStatusSubresource(&v1alpha1.Layer{}).
		Build()

	reconciler := &Reconciler{
		Client: fakeClient,
		Logger: logger,
	}

	req := ctrl.Request{
		NamespacedName: types.NamespacedName{
			Name:      "test-layer",
			Namespace: "test-ns",
		},
	}

	// Run reconcile
	res, err := reconciler.Reconcile(context.Background(), req)
	assert.NoError(t, err)
	assert.Equal(t, ctrl.Result{}, res)

	// Fetch updated layer
	var updatedLayer v1alpha1.Layer
	err = fakeClient.Get(context.Background(), req.NamespacedName, &updatedLayer)
	assert.NoError(t, err)

	// Verify status
	assert.Len(t, updatedLayer.Status.Conditions, 1)
	assert.Equal(t, v1alpha1.ConditionTypeReady, updatedLayer.Status.Conditions[0].Type)
	assert.Equal(t, metav1.ConditionTrue, updatedLayer.Status.Conditions[0].Status)
	assert.Equal(t, v1alpha1.ReasonProvisioned, updatedLayer.Status.Conditions[0].Reason)
}
