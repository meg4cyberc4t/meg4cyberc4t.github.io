# {{ .Title }}

{{ with .Description }}> {{ . | plainify | strings.TrimSpace }}

{{ end }}Canonical URL: {{ .Permalink }}
{{ with .Date }}Published: {{ .Format "2006-01-02" }}
{{ end }}{{ if and .Lastmod (ne .Lastmod .Date) }}Last updated: {{ .Lastmod.Format "2006-01-02" }}
{{ end }}
{{- $content := .RawContent -}}
{{- $content = replaceRE `(?ms)^[\t ]*\{\{<\s*markdown-alt\b.*?>\}\}[\t ]*\n` "" $content -}}
{{- $content = replaceRE `(?m)^[\t ]*\{\{<\s*/markdown-alt\s*>\}\}[\t ]*\n?` "" $content -}}
{{- $content = replaceRE `\{\{<\s*color-tag\s+"([^"]+)"\s*>\}\}` "$1" $content -}}
{{- printf "\n%s\n" ($content | strings.TrimSpace) }}
