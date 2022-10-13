declare module '@djencks/asciidoctor-mathjax' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Registry = import('asciidoctor').Asciidoctor.Extensions.Registry
  type Config = {}

  function register(registry: Registry, config?: Config): Registry
}
