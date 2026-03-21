package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/rest/dto"
)

// @id ListCanvasesV1alpha1
// @Summary List all canvases
// @Description List all the canvases the user has access to
// @Tags Canvas
// @Produce json
// @Param pagination query dto.PaginationRequest false "Pagination parameters"
// @Success 200 {object} dto.ListResponse[dto.Canvas]
// @Failure 400 {object} dto.ErrorResponse "Bad Request"
// @Failure 500 {object} dto.ErrorResponse "Internal Server Error"
// @Router /v1alpha1/canvases [get]
func (s *Server) listCanvasesV1alpha1(c *gin.Context) {
	var req dto.PaginationRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		s.logger.Error(err, "failed to bind pagination query")
		ValidationError(c, err)
		return
	}

	canvases, err := s.canvasService.List(c.Request.Context())
	if err != nil {
		s.logger.Error(err, "failed to list canvases")
		InternalServerError(c, err, "failed to list canvases")
		return
	}

	// Paginate the results in-memory and map to DTOs
	resp := dto.Paginate(canvases.Items, req, func(c orrayv1alpha1.Canvas) dto.Canvas {
		return dto.CanvasFromV1Alpha1(&c)
	})

	c.JSON(http.StatusOK, resp)
}
