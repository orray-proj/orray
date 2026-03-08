package main

import (
	"github.com/orray-proj/orray/pkg/logging"
	internalServer "github.com/orray-proj/orray/pkg/server"
)

type baseComponent struct {
	Logger *logging.Logger

	*internalServer.Config
}

// newBaseComponent creates a new base component for the controlplane
func newBaseComponent() *baseComponent {
	base := new(baseComponent)
	if err := base.bootstrap(); err != nil {
		panic(err)
	}
	return base
}

// Bootstrap initialized the component with server configuration
func (b *baseComponent) bootstrap() error {
	cfg := &internalServer.Config{}
	if err := internalServer.NewConfig(cfg); err != nil {
		return err
	}

	logger, err := logging.NewLoggerFromEnv()
	if err != nil {
		return err
	}

	b.Config = cfg
	b.Logger = logger
	return nil
}
