package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/orray-proj/orray/pkg/rest/dto"
)

// @id CreateCanvasV1alpha1
// @Summary Create a new canvas
// @Description Create a new canvas with the given display name
// @Tags Canvas
// @Accept json
// @Produce json
// @Param canvas body dto.CreateCanvasRequest true "Canvas data"
// @Success 201 {object} dto.Canvas
// @Failure 400 {object} dto.ErrorResponse "Bad Request"
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /v1alpha1/canvases [post]
func (s *Server) createCanvasV1alpha1(c *gin.Context) {
	var req dto.CreateCanvasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		ValidationError(c, err)
		return
	}

	canvas, err := s.canvasService.Create(c.Request.Context(), req.Name, req.DisplayName)
	if err != nil {
		s.logger.Error(err, "failed to create canvas")
		InternalServerError(c, err, "failed to create canvas")
		return
	}

	c.JSON(http.StatusCreated, dto.CanvasFromV1Alpha1(canvas))
}
