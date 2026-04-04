package indexer

import (
	"context"

	"github.com/orray-proj/orray/api/v1alpha1"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/manager"
)

const (
	// IndexCanvasID is the index name for Canvas UID.
	IndexCanvasID = "metadata.uid"
	// IndexLayerID is the index name for Layer UID.
	IndexLayerID = "metadata.uid"
)

// CanvasIndexer indexes Canvas and Layer resources.
type CanvasIndexer struct {
	mgr manager.Manager
}

// NewCanvasIndexer creates a new CanvasIndexer.
func NewCanvasIndexer(mgr manager.Manager) *CanvasIndexer {
	return &CanvasIndexer{
		mgr: mgr,
	}
}

// Index implements the Indexer interface.
func (i *CanvasIndexer) Index(ctx context.Context) error {
	if err := i.mgr.GetFieldIndexer().IndexField(ctx, &v1alpha1.Canvas{}, IndexCanvasID, func(rawObj client.Object) []string {
		canvas := rawObj.(*v1alpha1.Canvas)
		if canvas.UID == "" {
			return nil
		}
		return []string{string(canvas.UID)}
	}); err != nil {
		return err
	}

	return i.mgr.GetFieldIndexer().IndexField(ctx, &v1alpha1.Layer{}, IndexLayerID, func(rawObj client.Object) []string {
		layer := rawObj.(*v1alpha1.Layer)
		if layer.UID == "" {
			return nil
		}
		return []string{string(layer.UID)}
	})
}
