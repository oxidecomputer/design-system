import './index.css'

import { useState } from 'react'

import { Badge, Button, Checkbox, Spinner, Tabs } from '../components/src/ui'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-mono-sm text-secondary mb-2">{title}</h2>
      <div className="border-secondary flex flex-wrap items-center justify-center gap-4 rounded-lg border p-20">
        {children}
      </div>
    </div>
  )
}

function ComponentShowcase() {
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState(true)

  return (
    <div className="flex flex-col gap-8">
      <Section title="Button">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
      </Section>

      <Section title="Button sizes">
        <Button size="base">Base</Button>
        <Button size="sm">Small</Button>
        <Button size="icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
        </Button>
      </Section>

      <Section title="Button states">
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button variant="danger" disabled>
          Disabled danger
        </Button>
      </Section>

      <Section title="Badge">
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge color="destructive">Destructive</Badge>
          <Badge color="notice">Notice</Badge>
          <Badge color="neutral">Neutral</Badge>
          <Badge color="purple">Purple</Badge>
          <Badge color="blue">Blue</Badge>
        </div>

        <div className="flex gap-2">
          <Badge variant="solid">Default</Badge>
          <Badge variant="solid" color="destructive">
            Destructive
          </Badge>
          <Badge variant="solid" color="notice">
            Notice
          </Badge>
          <Badge variant="solid" color="neutral">
            Neutral
          </Badge>
          <Badge variant="solid" color="purple">
            Purple
          </Badge>
          <Badge variant="solid" color="blue">
            Blue
          </Badge>
        </div>
      </Section>

      <Section title="Spinner">
        <Spinner />
        <Spinner variant="secondary" />
        <Spinner variant="ghost" />
        <Spinner variant="danger" />
        <Spinner size="lg" />
      </Section>

      <Section title="Checkbox">
        <Checkbox checked={checked} onChange={() => setChecked(!checked)}>
          Unchecked
        </Checkbox>
        <Checkbox checked={!checked} onChange={() => setChecked(!checked)}>
          Checked
        </Checkbox>
        <Checkbox
          indeterminate={indeterminate}
          checked={false}
          onChange={() => setIndeterminate(!indeterminate)}
        >
          Indeterminate
        </Checkbox>
      </Section>

      <Section title="Tabs">
        <Tabs.Root defaultValue="one">
          <Tabs.List>
            <Tabs.Trigger value="one">Tab one</Tabs.Trigger>
            <Tabs.Trigger value="two">Tab two</Tabs.Trigger>
            <Tabs.Trigger value="three">Tab three</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="one">
            <p className="text-sans-md text-secondary">Content for tab one</p>
          </Tabs.Content>
          <Tabs.Content value="two">
            <p className="text-sans-md text-secondary">Content for tab two</p>
          </Tabs.Content>
          <Tabs.Content value="three">
            <p className="text-sans-md text-secondary">Content for tab three</p>
          </Tabs.Content>
        </Tabs.Root>
      </Section>
    </div>
  )
}

const headerToggleClass =
  'text-mono-sm text-secondary hover:text-default hover:bg-hover rounded-md px-3 py-1.5'

export default function App() {
  const [mode, setMode] = useState<'dark' | 'light'>('dark')

  return (
    <div className={mode === 'light' ? 'light' : undefined} data-theme={mode}>
      <div className="bg-default text-default min-h-screen">
        <div className="border-secondary bg-default sticky top-0 flex items-center justify-between border-b px-4 py-2">
          <h1 className="text-sans-lg text-raise">Component Preview</h1>
          <div className="flex gap-1">
            <button
              onClick={() => setMode('dark')}
              className={`${headerToggleClass} ${mode === 'dark' && 'bg-tertiary'}`}
            >
              Dark
            </button>
            <button
              onClick={() => setMode('light')}
              className={`${headerToggleClass} ${mode === 'light' && 'bg-tertiary'}`}
            >
              Light
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
          <ComponentShowcase />
        </div>
      </div>
    </div>
  )
}
