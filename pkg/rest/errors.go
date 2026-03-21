package rest

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/orray-proj/orray/pkg/rest/dto"
)

// AbortWithError sends a standardized error response and aborts the request.
func AbortWithError(c *gin.Context, statusCode int, code string, message string, details any) {
	requestID := c.GetString("requestId")
	
	resp := dto.ErrorResponse{
		Code:      code,
		Message:   message,
		Details:   details,
		RequestID: requestID,
	}

	c.AbortWithStatusJSON(statusCode, resp)
}

// InternalServerError responds with a 500 status code and a generic message.
func InternalServerError(c *gin.Context, err error, message string) {
	// Log the actual error here if needed, or assume it's already logged by the handler.
	if message == "" {
		message = "An unexpected error occurred"
	}
	AbortWithError(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, nil)
}

// BadRequest responds with a 400 status code.
func BadRequest(c *gin.Context, code string, message string, details any) {
	if code == "" {
		code = "BAD_REQUEST"
	}
	AbortWithError(c, http.StatusBadRequest, code, message, details)
}

// NotFound responds with a 404 status code.
func NotFound(c *gin.Context, message string) {
	if message == "" {
		message = "Resource not found"
	}
	AbortWithError(c, http.StatusNotFound, "NOT_FOUND", message, nil)
}

// ValidationError maps binding errors to a standardized format.
func ValidationError(c *gin.Context, err error) {
	// In a real app, we might parse the gin binding error to provide field-level details.
	BadRequest(c, "VALIDATION_ERROR", "Validation failed", fmt.Sprintf("%v", err))
}
