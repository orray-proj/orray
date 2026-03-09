package rest

import (
	"context"
	"fmt"
	"net/http"

	"github.com/caarlos0/env/v11"
	"github.com/gin-gonic/gin"
	"github.com/orray-proj/orray/pkg/logging"
	"github.com/orray-proj/orray/pkg/server"
	"k8s.io/client-go/kubernetes"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

// Config extends the base server config with REST-specific options.
type Config struct {
	server.Config `env:",init"`

	BindAddress string `env:"REST_BIND_ADDRESS" envDefault:":8080"`
	Mode        string `env:"REST_MODE" envDefault:"release"`
}

func NewConfig(cfg *Config) error {
	if err := env.Parse(cfg); err != nil {
		return fmt.Errorf("failed to parse rest config: %w", err)
	}
	return nil

}

// Server is the REST API server.
type Server struct {
	config *Config
	logger *logging.Logger
	router *gin.Engine

	kubeClient client.Client
	clientset  kubernetes.Interface
}

// NewServer creates a new REST API server.
func NewServer(ctx context.Context, cfg *Config, logger *logging.Logger, kubeClient client.Client, clientset kubernetes.Interface) *Server {
	if cfg.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	server := &Server{
		config:     cfg,
		logger:     logger.WithValues("component", "apiserver"),
		router:     nil,
		kubeClient: kubeClient,
		clientset:  clientset,
	}

	server.setupRESTRouter()
	return server
}

// Run starts the REST API server.
func (s *Server) Run(stopCh <-chan struct{}) error {
	s.logger.Info("Starting REST API server", "address", s.config.BindAddress)

	srv := &http.Server{
		Addr:    s.config.BindAddress,
		Handler: s.router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.logger.Error(err, "REST API server failed")
		}
	}()

	<-stopCh
	s.logger.Info("Stopping REST API server")
	return srv.Close()
}
