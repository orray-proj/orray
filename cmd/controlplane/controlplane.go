package main

import (
	"github.com/orray-proj/orray/pkg/logging"
	internalServer "github.com/orray-proj/orray/pkg/server"
)

type baseComponent struct {
	Logger *logging.Logger

	*internalServer.Config
}

// Bootstrap initialized the component with server configuration
func (b *baseComponent) Bootstrap() error {
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
