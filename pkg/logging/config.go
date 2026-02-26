package logging

import (
	"fmt"

	"github.com/caarlos0/env/v11"
	"github.com/go-playground/validator/v10"
	"github.com/mcuadros/go-defaults"
)

// Config is the configuration for the logging package.
type Config struct {
	// Level is the level of the logger.
	Level  Level  `env:"LOG_LEVEL"  validate:"oneof=DEBUG INFO WARN ERROR" default:"INFO"`
	Format Format `env:"LOG_FORMAT" validate:"oneof=console json" default:"console"`
}

// NewConfig creates a new Config with the given environment variables.
func NewConfig(cfg *Config) error {
	defaults.SetDefaults(cfg)
	if err := env.Parse(cfg); err != nil {
		return fmt.Errorf("failed to parse logging config: %w", err)
	}
	if err := validator.New().Struct(cfg); err != nil {
		return fmt.Errorf("failed to validate logging config: %w", err)
	}
	return nil
}
