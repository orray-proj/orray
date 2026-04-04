package api

import (
	"context"
	"testing"

	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestCanvasService(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = orrayv1alpha1.AddToScheme(scheme)

	seed := &orrayv1alpha1.Canvas{
		ObjectMeta: metav1.ObjectMeta{Name: "test"},
		Spec:       orrayv1alpha1.CanvasSpec{DisplayName: "Test Canvas"},
	}

	fakeClient := fake.NewClientBuilder().WithScheme(scheme).WithObjects(seed).Build()
	service := NewCanvasService(fakeClient)
	ctx := context.Background()

	t.Run("List Canvases", func(t *testing.T) {
		list, err := service.List(ctx)

		assert.NoError(t, err)
		assert.NotNil(t, list)
		assert.Len(t, list.Items, 1)
		assert.Equal(t, "Test Canvas", list.Items[0].Spec.DisplayName)
	})

	t.Run("Get Canvas", func(t *testing.T) {
		canvas, err := service.Get(ctx, "test")

		assert.NoError(t, err)
		assert.NotNil(t, canvas)
		assert.Equal(t, "test", canvas.Name)
	})

	t.Run("Delete Canvas", func(t *testing.T) {
		err := service.Delete(ctx, "test")
		assert.NoError(t, err)

		newList, _ := service.List(ctx)
		assert.Len(t, newList.Items, 0)
	})
}
