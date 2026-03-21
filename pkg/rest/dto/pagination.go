package dto

// PaginationRequest contains the standard query parameters for list requests.
type PaginationRequest struct {
	// Limit is the maximum number of items to return.
	Limit int `form:"limit,default=10" binding:"min=1,max=100"`
	// Offset is the number of items to skip.
	Offset int `form:"offset,default=0" binding:"min=0"`
}

// Pagination contains pagination metadata for list responses.
type Pagination struct {
	// Total is the total number of items available.
	Total int64 `json:"total"`
	// Limit is the maximum number of items requested.
	Limit int `json:"limit"`
	// Offset is the number of items skipped.
	Offset int `json:"offset"`
}

// ListResponse is a generic wrapper for paginated list responses.
type ListResponse[T any] struct {
	// Items is the slice of data being returned.
	Items []T `json:"items"`
	// Pagination contains the metadata for the current page.
	Pagination Pagination `json:"pagination"`
}

// NewListResponse creates a new paginated list response.
func NewListResponse[T any](items []T, total int64, limit, offset int) ListResponse[T] {
	return ListResponse[T]{
		Items: items,
		Pagination: Pagination{
			Total:  total,
			Limit:  limit,
			Offset: offset,
		},
	}
}

// Paginate takes a full slice of items and a PaginationRequest, 
// applies the slicing, and returns a ListResponse with mapped items.
// This is useful for in-memory pagination (e.g. from Kubernetes client results).
func Paginate[T any, R any](items []T, req PaginationRequest, mapper func(T) R) ListResponse[R] {
	total := int64(len(items))
	
	start := req.Offset
	if start > int(total) {
		start = int(total)
	}
	
	end := start + req.Limit
	if end > int(total) {
		end = int(total)
	}

	result := MapSlice(items[start:end], mapper)
	return NewListResponse(result, total, req.Limit, req.Offset)
}

// MapSlice is a generic utility to map a slice from one type to another.
func MapSlice[T any, R any](items []T, mapper func(T) R) []R {
	if items == nil {
		return nil
	}
	result := make([]R, len(items))
	for i, item := range items {
		result[i] = mapper(item)
	}
	return result
}
