package dto

// ErrorResponse represents a standard error response for the API.
type ErrorResponse struct {
	// Message is a human-readable description of the error.
	Message string `json:"message"`
	// Code is a machine-readable error code.
	Code string `json:"code,omitempty"`
	// Details provides additional context or field-level errors.
	Details any `json:"details,omitempty"`
	// RequestID is a unique identifier for the request, useful for debugging.
	RequestID string `json:"requestId,omitempty"`
}
