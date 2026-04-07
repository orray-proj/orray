package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/rest/dto"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
)

// @id ListLayersV1alpha1
// @Summary List all layers for a canvas
// @Description List all the layers belonging to a specific canvas
// @Tags Layer
// @Produce json
// @Param id path string true "Canvas ID (UID)"
// @Param pagination query dto.PaginationRequest false "Pagination parameters"
// @Success 200 {object} dto.ListResponse[dto.Layer]
// @Failure 400 {object} dto.ErrorResponse "Bad Request"
// @Failure 404 {object} dto.ErrorResponse "Not Found"
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /v1alpha1/canvases/{id}/layers [get]
func (s *Server) listLayersV1alpha1(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		ValidationError(c, nil)
		return
	}

	var req dto.PaginationRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		s.logger.Error(err, "failed to bind pagination query")
		ValidationError(c, err)
		return
	}

	canvas, err := s.canvasService.GetByID(c.Request.Context(), id)
	if err != nil {
		if apierrors.IsNotFound(err) {
			NotFound(c, "canvas not found")
			return
		}

		s.logger.Error(err, "failed to get canvas by id", "id", id)
		InternalServerError(c, err, "failed to get canvas")
		return
	}

	layers, err := s.layerService.List(c.Request.Context(), canvas.Name)
	if err != nil {
		s.logger.Error(err, "failed to list layers", "canvas", canvas.Name)
		InternalServerError(c, err, "failed to list layers")
		return
	}

	// Paginate the results in-memory and map to DTOs
	resp := dto.Paginate(layers.Items, req, func(l orrayv1alpha1.Layer) dto.Layer {
		return dto.LayerFromV1Alpha1(&l)
	})

	c.JSON(http.StatusOK, resp)
}
