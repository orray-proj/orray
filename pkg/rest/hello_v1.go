package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// @id hello_v1alpha1
// @Summary Say Hello v1alpha1
// @Description Hello
// @Tags Hello
// @Accept json
// @Produce json
// @Router /v1alpha1/hello [get]
func (s *Server) hellov1alpha1(c *gin.Context) {
	c.JSON(http.StatusOK, "hello")
}
