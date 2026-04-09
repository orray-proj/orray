package layer

import (
	"context"
	"testing"

	"github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	"github.com/stretchr/testify/assert"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestLayerWebhook_validateLayer(t *testing.T) {
	scheme := runtime.NewScheme()
	_ = corev1.AddToScheme(scheme)
	_ = v1alpha1.AddToScheme(scheme)

	logger, _ := logging.NewLogger(logging.DebugLevel, logging.JSONFormat)

	tests := []struct {
		name      string
		namespace *corev1.Namespace
		layer     *v1alpha1.Layer
		wantErr   bool
	}{
		{
			name: "namespace has canvas annotation",
			namespace: &corev1.Namespace{
				ObjectMeta: metav1.ObjectMeta{
					Name: "test-ns",
					Annotations: map[string]string{
						v1alpha1.AnnotationCanvas: "true",
					},
				},
			},
			layer: &v1alpha1.Layer{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "test-layer",
					Namespace: "test-ns",
				},
			},
			wantErr: false,
		},
		{
			name: "namespace has canvas label",
			namespace: &corev1.Namespace{
				ObjectMeta: metav1.ObjectMeta{
					Name: "test-ns",
					Labels: map[string]string{
						v1alpha1.AnnotationCanvas: "true",
					},
				},
			},
			layer: &v1alpha1.Layer{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "test-layer",
					Namespace: "test-ns",
				},
			},
			wantErr: false,
		},
		{
			name: "namespace does not have canvas annotation or label",
			namespace: &corev1.Namespace{
				ObjectMeta: metav1.ObjectMeta{
					Name: "test-ns",
				},
			},
			layer: &v1alpha1.Layer{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "test-layer",
					Namespace: "test-ns",
				},
			},
			wantErr: true,
		},
		{
			name:      "namespace not found",
			namespace: nil, // do not create the namespace in the fake client
			layer: &v1alpha1.Layer{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "test-layer",
					Namespace: "test-ns",
				},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clientBuilder := fake.NewClientBuilder().WithScheme(scheme)
			if tt.namespace != nil {
				clientBuilder = clientBuilder.WithObjects(tt.namespace)
			}
			fakeClient := clientBuilder.Build()

			webhook := NewLayerWebhook(fakeClient, logger)

			err := webhook.validateLayer(context.Background(), tt.layer)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
