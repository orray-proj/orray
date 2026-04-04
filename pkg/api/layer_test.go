package api

import (
	"context"
	"testing"

	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestLayerService(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = orrayv1alpha1.AddToScheme(scheme)

	fakeClient := fake.NewClientBuilder().
		WithScheme(scheme).
		WithIndex(&orrayv1alpha1.Layer{}, "metadata.uid", func(rawObj client.Object) []string {
			layer := rawObj.(*orrayv1alpha1.Layer)
			return []string{string(layer.UID)}
		}).
		Build()
	service := NewLayerService(fakeClient)
	ctx := context.Background()

	t.Run("Create Layer", func(t *testing.T) {
		namespace := "test-ns"
		name := "test-layer"
		spec := orrayv1alpha1.LayerSpec{
			Namespaces:  []string{"ns1", "ns2"},
			Color:       "#FF0000",
			Description: "A test layer",
		}

		layer := &orrayv1alpha1.Layer{
			ObjectMeta: metav1.ObjectMeta{
				Name:      name,
				Namespace: namespace,
				UID:       types.UID("uid-1"),
			},
			Spec: spec,
		}

		err := fakeClient.Create(ctx, layer)
		assert.NoError(t, err)

		assert.NotNil(t, layer)
		assert.Equal(t, name, layer.Name)
		assert.Equal(t, namespace, layer.Namespace)
		assert.Equal(t, spec, layer.Spec)
	})

	t.Run("List Layers", func(t *testing.T) {
		namespace := "test-ns"

		list, err := service.List(ctx, namespace)

		assert.NoError(t, err)
		assert.NotNil(t, list)
		assert.Len(t, list.Items, 1)
		assert.Equal(t, "test-layer", list.Items[0].Name)
		assert.Equal(t, namespace, list.Items[0].Namespace)
	})

	t.Run("List Layers In Other Namespace", func(t *testing.T) {
		otherNamespace := "other-ns"

		list, err := service.List(ctx, otherNamespace)

		assert.NoError(t, err)
		assert.NotNil(t, list)
		assert.Len(t, list.Items, 0)
	})

	t.Run("Create Another Layer in different namespace", func(t *testing.T) {
		namespace := "other-ns"
		name := "other-layer"
		spec := orrayv1alpha1.LayerSpec{
			Color: "#00FF00",
		}

		layer := &orrayv1alpha1.Layer{
			ObjectMeta: metav1.ObjectMeta{
				Name:      name,
				Namespace: namespace,
				UID:       types.UID("uid-2"),
			},
			Spec: spec,
		}

		err := fakeClient.Create(ctx, layer)
		assert.NoError(t, err)

		list, err := service.List(ctx, namespace)
		assert.NoError(t, err)
		assert.Len(t, list.Items, 1)
		assert.Equal(t, name, list.Items[0].Name)
	})

	t.Run("Get Layer by ID", func(t *testing.T) {
		id := "uid-1"

		result, err := service.GetByID(ctx, id)

		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.Equal(t, "test-layer", result.Name)
		assert.Equal(t, "test-ns", result.Namespace)
		assert.Equal(t, types.UID(id), result.UID)
	})

	t.Run("Get Layer by ID - Not Found", func(t *testing.T) {
		result, err := service.GetByID(ctx, "non-existent-id")

		assert.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "layer not found")
	})
}
