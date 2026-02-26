package indexer

import "context"

// Indexer is an interface for indexing resources.
type Indexer interface {
	Index(ctx context.Context) error
}
