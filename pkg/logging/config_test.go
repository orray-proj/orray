package logging

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewConfig(t *testing.T) {
	tests := []struct {
		name     string
		env      map[string]string
		expected Level
		wantErr  bool
	}{
		{
			name:     "default level",
			env:      map[string]string{},
			expected: InfoLevel,
			wantErr:  false,
		},
		{
			name: "debug level",
			env: map[string]string{
				"LOG_LEVEL": "DEBUG",
			},
			expected: DebugLevel,
			wantErr:  false,
		},
		{
			name: "info level",
			env: map[string]string{
				"LOG_LEVEL": "INFO",
			},
			expected: InfoLevel,
			wantErr:  false,
		},
		{
			name: "warn level",
			env: map[string]string{
				"LOG_LEVEL": "WARN",
			},
			expected: WarnLevel,
			wantErr:  false,
		},
		{
			name: "error level",
			env: map[string]string{
				"LOG_LEVEL": "ERROR",
			},
			expected: ErrorLevel,
			wantErr:  false,
		},
		{
			name: "invalid level",
			env: map[string]string{
				"LOG_LEVEL": "INVALID",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			for k, v := range tt.env {
				t.Setenv(k, v)
			}

			cfg := &Config{}
			err := NewConfig(cfg)

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expected, cfg.Level)
			}
		})
	}
}
