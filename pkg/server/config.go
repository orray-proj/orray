package server

import (
	"fmt"

	"github.com/caarlos0/env/v11"
	"github.com/mcuadros/go-defaults"
)

// Config contains the options for the server.
type Config struct {
	PprofBindAddress   string `env:"PPROF_BIND_ADDRESS" default:""`
	MetricsBindAddress string `env:"METRICS_BIND_ADDRESS" default:"0"`
}

// NewConfig creates a new Config with the given environment variables.
func NewConfig(cfg *Config) error {
	defaults.SetDefaults(cfg)
	if err := env.Parse(cfg); err != nil {
		return fmt.Errorf("failed to parse server config: %w", err)
	}
	return nil
}
