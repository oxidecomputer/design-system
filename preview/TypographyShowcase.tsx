import { useEffect, useState } from 'react'

function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  )
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

const BREAKPOINTS = [600, 800, 1000]

function ViewportRuler({ width }: { width: number }) {
  return (
    <div className="border-secondary bg-raise sticky top-11 z-10 flex items-center gap-4 border-b px-5 py-2">
      <span className="text-mono-sm text-raise tabular-nums">{width}px</span>
      <div className="flex gap-3">
        {BREAKPOINTS.map((bp) => (
          <span
            key={bp}
            className={`text-mono-xs ${width >= bp ? 'text-accent' : 'text-tertiary'}`}
          >
            ≥{bp}
          </span>
        ))}
      </div>
    </div>
  )
}

function SemanticRow({
  name,
  utility,
  steps,
}: {
  name: string
  utility: string
  steps: string
}) {
  return (
    <div className="border-secondary flex flex-col gap-3 border-b py-8">
      <div className="text-mono-xs text-tertiary flex items-baseline justify-between gap-4">
        <span>{name}</span>
        <span>{steps}</span>
      </div>
      <div className={`${utility} text-raise`}>
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  )
}

function PrimitiveRow({ utility }: { utility: string }) {
  return (
    <div className="border-secondary flex items-baseline gap-6 border-b py-4">
      <span className="text-mono-xs text-tertiary w-32 shrink-0">{utility}</span>
      <span className={`${utility} text-raise`}>
        The quick brown fox jumps over the lazy dog
      </span>
    </div>
  )
}

const NUMERIC_PRIMITIVES = [
  'text-sans-11',
  'text-sans-12',
  'text-sans-14',
  'text-sans-16',
  'text-sans-18',
  'text-sans-20',
  'text-sans-22',
  'text-sans-25',
  'text-sans-28',
  'text-sans-36',
  'text-sans-50',
  'text-sans-52',
  'text-sans-65',
]

const SEMANTIC_ALIASES: Array<[string, string]> = [
  ['text-sans-sm', '→ 12'],
  ['text-sans-md', '→ 14'],
  ['text-sans-lg', '→ 16'],
  ['text-sans-xl', '→ 18'],
  ['text-sans-2xl', '→ 25'],
  ['text-sans-3xl', '→ 36'],
  ['text-sans-4xl', '→ 52'],
  ['text-sans-5xl', '→ 65'],
]

export function TypographyShowcase() {
  const width = useViewportWidth()

  return (
    <div>
      <ViewportRuler width={width} />
      <div className="px-8 py-12">
        <h2 className="text-sans-2xl text-secondary mb-2">Semantic</h2>
        <section className="mb-16">
          <SemanticRow
            name="heading-display"
            utility="heading-display"
            steps="3xl → 4xl @800 → 65 @1000"
          />
          <SemanticRow
            name="heading-xl"
            utility="heading-xl"
            steps="2xl → 3xl @600 → 4xl @1000"
          />
          <SemanticRow
            name="heading-lg"
            utility="heading-lg"
            steps="xl → 2xl @600 → 3xl @1000"
          />
          <SemanticRow
            name="heading-md"
            utility="heading-md"
            steps="lg → xl @600 → 2xl @1000"
          />
        </section>

        <section className="mb-16">
          <h2 className="text-sans-2xl text-secondary mb-2">Numeric primitives</h2>
          {NUMERIC_PRIMITIVES.map((utility) => (
            <PrimitiveRow key={utility} utility={utility} />
          ))}
        </section>

        <section>
          <h2 className="text-sans-2xl text-secondary mb-2">Semantic aliases</h2>
          {SEMANTIC_ALIASES.map(([utility, alias]) => (
            <div
              key={utility}
              className="border-secondary flex items-baseline gap-6 border-b py-4"
            >
              <span className="text-mono-xs text-tertiary w-32 shrink-0">{utility}</span>
              <span className="text-mono-xs text-quaternary w-20 shrink-0">{alias}</span>
              <span className={`${utility} text-raise`}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
