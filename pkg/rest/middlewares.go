package rest

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/orray-proj/orray/api/docs"
)

// requestID returns middleware that adds a unique ID to each request.
func requestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		c.Set("requestId", reqID)
		c.Header("X-Request-ID", reqID)
		c.Next()
	}
}

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
