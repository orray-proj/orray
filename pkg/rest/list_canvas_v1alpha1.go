package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// @id ListCanvasesV1alpha1
// @Summary List all canvases
// @Description List all the canvases the user has access to
// @Tags Canvas
// @Produce json
// @Success 200 {string} string "OK"
// @Router /v1alpha1/canvases [get]
func (s *Server) listCanvasesV1alpha1(c *gin.Context) {
	c.JSON(http.StatusOK, "hello")
}
