{{/*
Expand the name of the chart.
*/}}
{{- define "orray.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "orray.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create image reference as used by resources.
*/}}
{{- define "orray.image" -}}
{{- $tag := default .Chart.AppVersion .Values.image.tag -}}
{{- printf "%s:%s" .Values.image.repository $tag -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "orray.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "orray.labels" -}}
helm.sh/chart: {{ include "orray.chart" . }}
{{ include "orray.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "orray.selectorLabels" -}}
app.kubernetes.io/name: {{ include "orray.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "orray.controller.labels" -}}
app.kubernetes.io/component: controller
{{- end -}}

{{- define "orray.webhooksServer.labels" -}}
app.kubernetes.io/component: webhooks-server
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "orray.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "orray.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Determine the most appropriate CPU resource field for GOMAXPROCS.
Prioritizes limits over requests, with a fallback to limits if neither is set.
*/}}
{{- define "orray.selectCpuResourceField" -}}
  {{- $resources := .resources -}}
  {{- $hasLimits := and $resources (hasKey $resources "limits") (ne (toString $resources.limits.cpu) "") -}}
  {{- $hasRequests := and $resources (hasKey $resources "requests") (ne (toString $resources.requests.cpu) "") -}}
  {{- if $hasLimits -}}
    limits.cpu
  {{- else if $hasRequests -}}
    requests.cpu
  {{- else -}}
    limits.cpu
  {{- end -}}
{{- end -}}
