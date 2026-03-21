package dto

import "github.com/orray-proj/orray/api/v1alpha1"

// CreateCanvasRequest is the request body for creating a canvas.
type CreateCanvasRequest struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
}

// Canvas is a minimal wrapper around the spec from the v1alpha1 api
type Canvas struct {
	v1alpha1.CanvasSpec

	Id   string `json:"id" binding:"required"`
	Name string `json:"name" binding:"required"`
}

// CanvasFromV1Alpha1 convert a convas to its DTO
func CanvasFromV1Alpha1(c *v1alpha1.Canvas) Canvas {
	return Canvas{
		CanvasSpec: c.Spec,
		Id:         string(c.UID),
		Name:       c.Name,
	}
}
