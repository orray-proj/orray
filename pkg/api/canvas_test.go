package api

import (
	"context"
	"testing"

	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/stretchr/testify/assert"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestCanvasService(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = orrayv1alpha1.AddToScheme(scheme)

	fakeClient := fake.NewClientBuilder().
		WithScheme(scheme).
		WithIndex(&orrayv1alpha1.Canvas{}, "metadata.uid", func(rawObj client.Object) []string {
			canvas := rawObj.(*orrayv1alpha1.Canvas)
			return []string{string(canvas.UID)}
		}).
		Build()
	service := NewCanvasService(fakeClient)
	ctx := context.Background()

	t.Run("Create Canvas", func(t *testing.T) {
		name := "test"
		displayName := "Test Canvas"
		canvas, err := service.Create(ctx, name, displayName)

		assert.NoError(t, err)
		assert.NotNil(t, canvas)
		assert.Equal(t, displayName, canvas.Spec.DisplayName)
		assert.Equal(t, name, canvas.Name)
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

	t.Run("Get Canvas by ID", func(t *testing.T) {
		list, _ := service.List(ctx)
		canvas := list.Items[0]
		id := string(canvas.UID)

		result, err := service.GetByID(ctx, id)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, canvas.Name, result.Name)
		assert.Equal(t, canvas.UID, result.UID)
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
