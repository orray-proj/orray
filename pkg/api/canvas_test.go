package api

import (
	"context"
	"testing"

	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/stretchr/testify/assert"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestCanvasService(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = orrayv1alpha1.AddToScheme(scheme)

	fakeClient := fake.NewClientBuilder().WithScheme(scheme).Build()
	service := NewCanvasService(fakeClient)
	ctx := context.Background()

	t.Run("Create Canvas", func(t *testing.T) {
		name := "test"
		displayName := "Test Canvas"
		canvas, err := service.Create(ctx, name, displayName)

		assert.NoError(t, err)
		assert.NotNil(t, canvas)
		assert.Equal(t, displayName, canvas.Spec.DisplayName)
		assert.Equal(t, name, canvas.ObjectMeta.Name)
	})

	t.Run("List Canvases", func(t *testing.T) {
		list, err := service.List(ctx)

		assert.NoError(t, err)
		assert.NotNil(t, list)
		assert.Len(t, list.Items, 1)
		assert.Equal(t, "Test Canvas", list.Items[0].Spec.DisplayName)
	})

	t.Run("Get Canvas", func(t *testing.T) {
		list, _ := service.List(ctx)
		name := list.Items[0].Name

		canvas, err := service.Get(ctx, name)

		assert.NoError(t, err)
		assert.NotNil(t, canvas)
		assert.Equal(t, name, canvas.Name)
	})

	t.Run("Delete Canvas", func(t *testing.T) {
		list, _ := service.List(ctx)
		name := list.Items[0].Name

		err := service.Delete(ctx, name)
		assert.NoError(t, err)

		newList, _ := service.List(ctx)
		assert.Len(t, newList.Items, 0)
	})
}
