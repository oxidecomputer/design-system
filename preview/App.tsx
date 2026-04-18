import './index.css'

import { useState } from 'react'

import { Badge, Button, Checkbox, Spinner, Tabs } from '../components/src/ui'
import { CodeBlock } from './CodeBlock'

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

      <Section title="Syntax highlighting (Rust)">
        <CodeBlock
          lang="rust"
          code={`fn main() {
    let greeting = "Hello, world!";
    let count: u32 = 42;
    println!("{} ({})", greeting, count);

    let nums = vec![1, 2, 3];
    let sum: u32 = nums.iter().sum();
    println!("sum = {}", sum);
}`}
        />
      </Section>

      <Section title="Syntax highlighting (TypeScript)">
        <CodeBlock
          lang="tsx"
          code={`/**
 * @module example
 * Comprehensive syntax demo for the Oxide Dark theme.
 */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const PI = 3.14159
const HEX = 0xff00aa
const ENABLED = true
const NAME: string = 'world\\n'
const RE = /^[a-z]+\\d{2,}$/i

enum Status {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
}

interface Greeter<T extends string> {
  readonly name: T
  greet(loud?: boolean): string
}

type Props = {
  message: string
  count?: number
  children?: ReactNode
}

class Hello implements Greeter<'hello'> {
  readonly name = 'hello' as const
  static #instances = 0

  constructor(private prefix: string = '>>') {
    Hello.#instances += 1
  }

  greet(loud = false): string {
    const out = \`\${this.prefix} \${NAME.toUpperCase()}\`
    return loud ? out.repeat(2) : out
  }
}

async function load(url: string): Promise<Status> {
  try {
    const res = await fetch(url)
    return res.ok ? Status.Ready : Status.Idle
  } catch (err) {
    console.error('failed', err)
    return Status.Idle
  }
}

export function Counter({ message, count = 0, children }: Props) {
  const [n, setN] = useState<number>(count)
  useEffect(() => { void load('/ping') }, [])

  return (
    <section className="counter" data-status={n > 0 ? 'on' : 'off'}>
      <h1>{message}</h1>
      <button onClick={() => setN((c) => c + 1)} disabled={n >= 10}>
        Clicked {n} times
      </button>
      {children ?? <em>no children</em>}
    </section>
  )
}`}
        />
      </Section>

      <Section title="Syntax highlighting (JSON)">
        <CodeBlock
          lang="json"
          code={`{
  "name": "test/system",
  "version": "6.0.5",
  "private": false,
  "dependencies": {
    "shiki": "^3.13.0",
    "react": "^18.0.0"
  },
  "scripts": {
    "preview:dev": "vite --config preview/vite.config.ts"
  }
}`}
        />
      </Section>

      <Section title="Syntax highlighting (YAML)">
        <CodeBlock
          lang="yaml"
          code={`---
# service config
service: &svc web-api
config:
  enabled: true
  retries: 3
  hosts:
    - example.com
    - 127.0.0.1
fallback: *svc`}
        />
      </Section>

      <Section title="Syntax highlighting (TOML)">
        <CodeBlock
          lang="toml"
          code={`# config
title = "Example"
enabled = true
retries = 3
created = 2026-04-17T08:00:00Z

[server]
host = "example.com"
port = 8080`}
        />
      </Section>

      <Section title="Syntax highlighting (CSS)">
        <CodeBlock
          lang="css"
          code={`/* sample stylesheet */
:root {
  --brand: #ff6785;
}

.button[data-variant="primary"]:hover {
  color: var(--brand);
  font-size: 1.25rem;
  padding: 8px 12px;
  background: linear-gradient(90deg, #08f 0%, #80f 100%);
}`}
        />
      </Section>

      <Section title="Syntax highlighting (diff)">
        <CodeBlock
          lang="diff"
          code={`--- a/file.ts
+++ b/file.ts
@@ -1,4 +1,4 @@
 export function greet(name) {
-  return "hi " + name
+  return \`hello \${name}\`
 }`}
        />
      </Section>

      <Section title="Syntax highlighting (Markdown)">
        <CodeBlock
          lang="md"
          code={`# Heading 1
## Heading 2

A paragraph with **bold**, *italic*, and \`inline code\`.

> A blockquote.

- list item one
- list item two

[link text](https://example.com)`}
        />
      </Section>

      <Section title="Syntax highlighting (Go)">
        <CodeBlock
          lang="go"
          code={`// Package main is a demo.
package main

import "fmt"

//go:generate echo "hello"

// Server holds connection settings.
type Server struct {
\tHost string
\tPort int
}

func main() {
\ts := Server{Host: "localhost", Port: 8080}
\tfmt.Printf("server on %s:%d\\n", s.Host, s.Port)
}`}
        />
      </Section>

      <Section title="Syntax highlighting (GraphQL)">
        <CodeBlock
          lang="graphql"
          code={`# fetch a user
query GetUser($id: ID!) {
  user(id: $id) {
    name: fullName
    role
    posts(limit: 5) {
      title
      tags
    }
  }
}`}
        />
      </Section>

      <Section title="Syntax highlighting (OxQL)">
        <CodeBlock
          lang="oxql"
          code={`get sled_data_link:bytes_sent
    | filter timestamp > @now() - 1h
    | align mean_within(5m)
    | group_by [sled_serial]`}
        />
      </Section>

      <Section title="Syntax highlighting (P4)">
        <CodeBlock
          lang="p4"
          code={`action mcast_forward_ipv4_to(ipv6_addr_t target,
                             mac_addr_t inner_mac,
                             geneve_vni_t vni) {
    meta.nat_ingress_tgt = target;     // admin-local underlay group
    meta.nat_inner_mac   = inner_mac;
    meta.nat_geneve_vni  = vni;        // VNI carried as action data
    meta.encap_needed    = true;
}

table ingress_ipv4_mcast {
    key = {
        hdr.ipv4.dst_addr  : exact;    // external IPv4 group address
        hdr.vlan.isValid() : exact;
        hdr.vlan.vlan_id   : exact;
    }
    actions = {
        mcast_forward_ipv4_to;
    }
}

table mcast_replication_ipv6 {
    key = { hdr.ipv6.dst_addr : exact; } // admin-local underlay group
    actions = {
        configure_mcastv6;
        drop_mcastv6_admin_scoped_no_group;
    }
}`}
        />
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
