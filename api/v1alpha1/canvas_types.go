package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:resource:path=canvases
// +kubebuilder:resource:scope=Cluster
// +kubebuilder:printcolumn:name="Ready",type="string",JSONPath=".status.conditions[?(@.type==\"Ready\")].status"
// +kubebuilder:printcolumn:name="Status",type="string",JSONPath=".status.conditions[?(@.type==\"Ready\")].message"
// +kubebuilder:printcolumn:name=Age,type=date,JSONPath=`.metadata.creationTimestamp`

// Canvas is a resource type that describes a Canvas.
type Canvas struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	// Spec describes the Canvas.
	Spec CanvasSpec `json:"spec,omitempty"`

	// Status describes the current status of a Canvas.
	Status CanvasStatus `json:"status,omitempty"`
}

const (
	// AnnotationCanvas is the annotation key for an orray canvas.
	AnnotationCanvas = "orray.dev/canvas"
	// AnnotationManagedBy is the annotation key for the manager of the canvas.
	AnnotationManagedBy = "orray.dev/managed-by"

	// FinalizerCanvas is the finalizer for a Canvas.
	FinalizerCanvas = "orray.dev/finalizer"

	// ConditionTypeReady is the condition type for the Canvas's ready state.
	ConditionTypeReady = "Ready"

	// ReasonProvisioning is the reason for the Canvas being in a provisioning state.
	ReasonProvisioning = "Provisioning"
	// ReasonProvisioned is the reason for the Canvas being in a provisioned state.
	ReasonProvisioned = "Provisioned"
	// ReasonFailed is the reason for the Canvas being in a failed state.
	ReasonFailed = "Failed"

	// ManagedByValue is the value for the ManagedBy annotation.
	ManagedByValue = "orray-controller"
)

func (p *Canvas) GetStatus() *CanvasStatus {
	return &p.Status
}

// Spec describes the Canvas.
type CanvasSpec struct {
	DisplayName string `json:"displayName,omitempty"`
}

// Status describes the current status of a Canvas.
type CanvasStatus struct {
	// Conditions contains the last observations of the Canvas's current
	// state.
	//
	// +patchMergeKey=type
	// +patchStrategy=merge
	// +listType=map
	// +listMapKey=type
	Conditions []metav1.Condition `json:"conditions,omitempty" patchMergeKey:"type" patchStrategy:"merge"`
	// ObservedGeneration represents the .metadata.generation that this
	// instance was reconciled against.
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
}

// GetConditions implements the conditions.Getter interface.
func (p *CanvasStatus) GetConditions() []metav1.Condition {
	return p.Conditions
}

// SetConditions implements the conditions.Setter interface.
func (p *CanvasStatus) SetConditions(conditions []metav1.Condition) {
	p.Conditions = conditions
}

// +kubebuilder:object:root=true

// CanvasConfigList is a list of Canvas resources.
type CanvasList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Canvas `json:"items"`
}
