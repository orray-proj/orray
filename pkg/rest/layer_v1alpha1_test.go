package rest

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	orrayv1alpha1 "github.com/orray-proj/orray/api/v1alpha1"
	"github.com/orray-proj/orray/pkg/logging"
	"github.com/stretchr/testify/assert"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type stubCanvasService struct {
	getByID func(ctx context.Context, id string) (*orrayv1alpha1.Canvas, error)
}

func (s *stubCanvasService) Create(ctx context.Context, name, displayName string) (*orrayv1alpha1.Canvas, error) {
	return nil, errors.New("not implemented")
}

func (s *stubCanvasService) List(ctx context.Context) (*orrayv1alpha1.CanvasList, error) {
	return nil, errors.New("not implemented")
}

func (s *stubCanvasService) Get(ctx context.Context, name string) (*orrayv1alpha1.Canvas, error) {
	return nil, errors.New("not implemented")
}

func (s *stubCanvasService) GetByID(ctx context.Context, id string) (*orrayv1alpha1.Canvas, error) {
	return s.getByID(ctx, id)
}

func (s *stubCanvasService) Delete(ctx context.Context, name string) error {
	return errors.New("not implemented")
}

type stubLayerService struct{}

func (s *stubLayerService) Create(
	ctx context.Context, namespace, name string, spec orrayv1alpha1.LayerSpec,
) (*orrayv1alpha1.Layer, error) {
	return nil, errors.New("not implemented")
}

func (s *stubLayerService) List(ctx context.Context, namespace string) (*orrayv1alpha1.LayerList, error) {
	return nil, errors.New("not implemented")
}

func (s *stubLayerService) GetByID(ctx context.Context, id string) (*orrayv1alpha1.Layer, error) {
	return nil, errors.New("not implemented")
}

func newTestServer(t *testing.T, canvasErr error) *Server {
	t.Helper()

	logger, err := logging.NewLogger(logging.DebugLevel, logging.JSONFormat)
	if err != nil {
		t.Fatalf("failed to create logger: %v", err)
	}

	return &Server{
		logger: logger,
		canvasService: &stubCanvasService{
			getByID: func(ctx context.Context, id string) (*orrayv1alpha1.Canvas, error) {
				if canvasErr != nil {
					return nil, canvasErr
				}

				return &orrayv1alpha1.Canvas{
					ObjectMeta: metav1.ObjectMeta{
						Name: "canvas-name",
					},
				}, nil
			},
		},
		layerService: &stubLayerService{},
	}
}

func TestCreateLayerV1alpha1ReturnsNotFoundForMissingCanvas(t *testing.T) {
	gin.SetMode(gin.TestMode)

	server := newTestServer(t, apierrors.NewNotFound(
		schema.GroupResource{Group: orrayv1alpha1.GroupVersion.Group, Resource: "canvases"},
		"missing-canvas",
	))

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Params = gin.Params{{Key: "id", Value: "missing-canvas"}}
	c.Request = httptest.NewRequest(
		http.MethodPost,
		"/api/v1alpha1/canvases/missing-canvas/layers",
		bytes.NewBufferString(`{"name":"prod","namespaces":["payments-prod"],"color":"#fff"}`),
	)
	c.Request.Header.Set("Content-Type", "application/json")

	server.createLayerV1alpha1(c)

	assert.Equal(t, http.StatusNotFound, recorder.Code)
	assert.Contains(t, recorder.Body.String(), `"code":"NOT_FOUND"`)
}

func TestCreateLayerV1alpha1ReturnsInternalErrorForCanvasLookupFailures(t *testing.T) {
	gin.SetMode(gin.TestMode)

	server := newTestServer(t, errors.New("boom"))

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Params = gin.Params{{Key: "id", Value: "canvas-id"}}
	c.Request = httptest.NewRequest(
		http.MethodPost,
		"/api/v1alpha1/canvases/canvas-id/layers",
		bytes.NewBufferString(`{"name":"prod","namespaces":["payments-prod"],"color":"#fff"}`),
	)
	c.Request.Header.Set("Content-Type", "application/json")

	server.createLayerV1alpha1(c)

	assert.Equal(t, http.StatusInternalServerError, recorder.Code)
	assert.Contains(t, recorder.Body.String(), `"code":"INTERNAL_SERVER_ERROR"`)
}

func TestListLayersV1alpha1ReturnsNotFoundForMissingCanvas(t *testing.T) {
	gin.SetMode(gin.TestMode)

	server := newTestServer(t, apierrors.NewNotFound(
		schema.GroupResource{Group: orrayv1alpha1.GroupVersion.Group, Resource: "canvases"},
		"missing-canvas",
	))

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Params = gin.Params{{Key: "id", Value: "missing-canvas"}}
	c.Request = httptest.NewRequest(
		http.MethodGet,
		"/api/v1alpha1/canvases/missing-canvas/layers",
		nil,
	)

	server.listLayersV1alpha1(c)

	assert.Equal(t, http.StatusNotFound, recorder.Code)
	assert.Contains(t, recorder.Body.String(), `"code":"NOT_FOUND"`)
}

func TestListLayersV1alpha1ReturnsInternalErrorForCanvasLookupFailures(t *testing.T) {
	gin.SetMode(gin.TestMode)

	server := newTestServer(t, errors.New("boom"))

	recorder := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(recorder)
	c.Params = gin.Params{{Key: "id", Value: "canvas-id"}}
	c.Request = httptest.NewRequest(
		http.MethodGet,
		"/api/v1alpha1/canvases/canvas-id/layers",
		nil,
	)

	server.listLayersV1alpha1(c)

	assert.Equal(t, http.StatusInternalServerError, recorder.Code)
	assert.Contains(t, recorder.Body.String(), `"code":"INTERNAL_SERVER_ERROR"`)
}
