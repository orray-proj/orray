package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/rest/dto"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
)

// @id CreateLayerV1alpha1
// @Summary Create a new layer
// @Description Create a new layer for a specific canvas
// @Tags Layer
// @Accept json
// @Produce json
// @Param id path string true "Canvas ID (UID)"
// @Param layer body dto.CreateLayerRequest true "Layer data"
// @Success 201 {object} dto.Layer
// @Failure 400 {object} dto.ErrorResponse "Bad Request"
// @Failure 404 {object} dto.ErrorResponse "Not Found"
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /v1alpha1/canvases/{id}/layers [post]
func (s *Server) createLayerV1alpha1(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		ValidationError(c, nil)
		return
	}

	var req dto.CreateLayerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
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

	layerSpec := orrayv1alpha1.LayerSpec{
		Namespaces:  req.Namespaces,
		Color:       req.Color,
		Description: req.Description,
	}

	layer, err := s.layerService.Create(c.Request.Context(), canvas.Name, req.Name, layerSpec)
	if err != nil {
		s.logger.Error(err, "failed to create layer")
		InternalServerError(c, err, "failed to create layer")
		return
	}

	c.JSON(http.StatusCreated, dto.LayerFromV1Alpha1(layer))
}
