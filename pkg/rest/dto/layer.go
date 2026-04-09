package dto

import "github.com/orray-proj/orray/api/v1alpha1"

// CreateLayerRequest is the request body for creating a layer.
type CreateLayerRequest struct {
	Name        string   `json:"name" binding:"required"`
	Namespaces  []string `json:"namespaces" binding:"required"`
	Color       string   `json:"color" binding:"required"`
	Description string   `json:"description,omitempty"`
}

// Layer is a minimal wrapper around the spec from the v1alpha1 api
type Layer struct {
	v1alpha1.LayerSpec

	Id   string `json:"id" binding:"required"`
	Name string `json:"name" binding:"required"`
}

// LayerFromV1Alpha1 convert a layer to its DTO
func LayerFromV1Alpha1(l *v1alpha1.Layer) Layer {
	return Layer{
		LayerSpec: l.Spec,
		Id:        string(l.UID),
		Name:      l.Name,
	}
}
