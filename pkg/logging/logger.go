package logging

import (
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"k8s.io/klog/v2"
	runtimelog "sigs.k8s.io/controller-runtime/pkg/log"
)

type (
	Level  int8
	Format string
)

const (
	ErrorLevel Level = Level(zapcore.ErrorLevel)
	WarnLevel  Level = Level(zapcore.WarnLevel)
	InfoLevel  Level = Level(zapcore.InfoLevel)
	DebugLevel Level = Level(zapcore.DebugLevel)

	ConsoleFormat Format = "console"
	JSONFormat    Format = "json"
)

// Logger is a simple wrapper around zap.Logger that provides a more ergonomic
// API.
type Logger struct {
	logger *zap.SugaredLogger
}

var (
	writer       zapcore.WriteSyncer
	globalLogger *Logger
)

func init() {
	// Create a write syncer that all our underlying zap.Loggers will use and we
	// can also pass to klog. This ensures all logs are synchronized and written
	// to the same destination.
	var err error
	if writer, _, err = zap.Open("stderr"); err != nil {
		panic(err)
	}

	// Create the global logger
	if globalLogger, err = NewLoggerFromEnv(); err != nil {
		panic(err)
	}

	// Configure klog to use the same writer
	klog.InitFlags(nil)
	klog.SetOutput(writer)
	klogLevel := "0"
	if k := os.Getenv("KLOG_LEVEL"); k != "" {
		klogLevel = k
	}
	if err = flag.Set("v", klogLevel); err != nil {
		panic(err)
	}

	// Configure controller-runtime to use our globalLogger's underlying
	// zap.Logger wrapped as a logr.Logger.
	runtimelog.SetLogger(
		zapr.NewLoggerWithOptions(
			// Reverse the skip we added in Wrap()
			globalLogger.logger.Desugar().WithOptions(zap.AddCallerSkip(-1)),
		),
	)
}

func NewLoggerFromEnv() (*Logger, error) {
	cfg := &Config{}
	if err := NewConfig(cfg); err != nil {
		return nil, err
	}
	return NewLogger(cfg.Level, cfg.Format)
}

// NewLogger returns a new *Logger with the provided log level.
func NewLogger(level Level, format Format) (*Logger, error) {
	if level < DebugLevel || level > ErrorLevel {
		return nil, fmt.Errorf("invalid log level: %d", level)
	}

	cfg := zap.NewProductionConfig()
	cfg.Encoding = string(format)
	cfg.EncoderConfig.EncodeTime = func(
		time time.Time,
		encoder zapcore.PrimitiveArrayEncoder,
	) {
		zapcore.RFC3339TimeEncoder(time.UTC(), encoder)
	}
	cfg.DisableStacktrace = false
	cfg.Level = zap.NewAtomicLevelAt(zapcore.Level(level))

	var encoder zapcore.Encoder
	switch format { // format was already validated above
	case ConsoleFormat:
		encoder = zapcore.NewConsoleEncoder(cfg.EncoderConfig)
	case JSONFormat:
		encoder = zapcore.NewJSONEncoder(cfg.EncoderConfig)
	}
	logger, err := cfg.Build(
		zap.WrapCore(func(core zapcore.Core) zapcore.Core {
			// Create a new core with our global writer plugged in.
			return zapcore.NewCore(encoder, writer, core)
		}),
	)
	if err != nil {
		return nil, err
	}

	return Wrap(logger), nil
}

// Wrap returns a new *Logger that wraps the provided zap.Logger.
func Wrap(zapLogger *zap.Logger) *Logger {
	return &Logger{
		logger: zapLogger.Sugar().WithOptions(zap.AddCallerSkip(1)),
	}
}

// WithValues adds key-value pairs to a logger's context.
func (l *Logger) WithValues(keysAndValues ...any) *Logger {
	return &Logger{
		logger: l.logger.With(keysAndValues...),
	}
}

// Error logs a message at the error level.
func (l *Logger) Error(err error, msg string, keysAndValues ...any) {
	l.logger.Errorw(fmt.Sprintf("%s: %v", msg, err), keysAndValues...,
	)
}

// Warn logs a message at warn level.
func (l *Logger) Warn(msg string, keysAndValues ...any) {
	l.logger.Warnw(msg, keysAndValues...)
}

// Info logs a message at the info level.
func (l *Logger) Info(msg string, keysAndValues ...any) {
	l.logger.Infow(msg, keysAndValues...)
}

// Debug logs a message at the debug level.
func (l *Logger) Debug(msg string, keysAndValues ...any) {
	l.logger.Debugw(msg, keysAndValues...)
}

// Logr returns a logr.Logger wrapped in this Logger's underlying zap.Logger for
// cases where one needs to to pass the a logr.Logger to another library that
// obviously doesn't know how to work with our custom one.
func (l *Logger) Logr() logr.Logger {
	return zapr.NewLoggerWithOptions(l.logger.Desugar().WithOptions(zap.AddCallerSkip(-1)))
}
