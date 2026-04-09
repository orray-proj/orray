package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:resource:path=layers
// +kubebuilder:printcolumn:name="Ready",type="string",JSONPath=".status.conditions[?(@.type==\"Ready\")].status"
// +kubebuilder:printcolumn:name="Status",type="string",JSONPath=".status.conditions[?(@.type==\"Ready\")].message"
// +kubebuilder:printcolumn:name=Age,type=date,JSONPath=`.metadata.creationTimestamp`

// Layer is a resource type that describes a Layer in a Canvas.
type Layer struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	// Spec describes the Layer.
	Spec LayerSpec `json:"spec,omitempty"`

	// Status describes the current status of a Layer.
	Status LayerStatus `json:"status,omitempty"`
}

func (p *Layer) GetStatus() *LayerStatus {
	return &p.Status
}

// LayerSpec describes the Layer.
type LayerSpec struct {
	// Namespaces is a list of namespaces that belong to this layer.
	Namespaces []string `json:"namespaces"`

	// Color is a color used to recognize the layer among other layers.
	Color string `json:"color"`

	// Description is an optional description of the layer.
	// +optional
	Description string `json:"description,omitempty"`
}

// LayerStatus describes the current status of a Layer.
type LayerStatus struct {
	// Conditions contains the last observations of the Layer's current state.
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
func (p *LayerStatus) GetConditions() []metav1.Condition {
	return p.Conditions
}

// SetConditions implements the conditions.Setter interface.
func (p *LayerStatus) SetConditions(conditions []metav1.Condition) {
	p.Conditions = conditions
}

// +kubebuilder:object:root=true

// LayerList is a list of Layer resources.
type LayerList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Layer `json:"items"`
}
