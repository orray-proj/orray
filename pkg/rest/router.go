package rest

import (
	"github.com/gin-gonic/gin"
	_ "github.com/orray-proj/orray/api/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Orray API
// @version 1.0
// @description This is the Orray API server.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api

// securityHeaders returns middleware that sets protective HTTP headers on every response.
func securityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Next()
	}
}

func (s *Server) setupRESTRouter() {
	router := gin.Default()

	router.Use(securityHeaders())

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	api := router.Group("/api")
	v1alpha1 := api.Group("/v1alpha1")
	{
		v1alpha1.GET("/canvases", s.listCanvasesV1alpha1)
	}

	s.router = router
}
