/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useEffect, useState } from 'react'

import { highlightCode } from '../components/src/asciidoc/util'
import { Mermaid } from '../components/src/diagram'

// Recreations of hand-drawn reference diagrams; covers styling Pele can't infer
const diagrams: { title: string; source: string }[] = [
  {
    title: 'Orchestrator',
    source: `flowchart TB
  subgraph oxide [Oxide]
    O[Orchestrator VM]
    C[Creates via Oxide API]
    R[Reaps after shutdown]
    E[Ephemeral Runner VM]
    O --> C --> E
    O -.-> R -.-> E
  end
  P[Pools for work orders]
  S[Run session and inference]
  G[Clone, push]
  A[Model Provider]
  H[Git Host]
  P --> O
  P --> A
  E <--> S <--> A
  E <--> G <--> H`,
  },
  {
    title: 'Alert delivery',
    source: `flowchart TB
  P[Alert published] --> F
  F@{ shape: st-rect, label: "For each receiver" }
  F --> Q{"Is this receiver subscribed to the alert’s class?"}
  Q -. No .-> F
  Q -. Yes .-> D{{Dispatch alert to receiver}}
  D --> F
  RS[Alert resent to receiver] --> AD
  D --> AD
  subgraph delivery [Delivery]
    AD[Attempt delivery] --> S{Is delivery successful?}
    S -. No .-> N{How many attempts?}
    N -. 1 .-> W1[Wait 1 minute]
    N -. 2 .-> W5[Wait 5 minutes]
    N -. 3 .-> FAIL[Delivery fails]
    S -. Yes .-> OK[Delivery succeeds]
    W1 --> AD
    W5 --> AD
  end`,
  },
  {
    title: 'Ephemeral runner sequence',
    source: `sequenceDiagram
  participant Dev as Developer
  participant CI as CI/CD Platform
  participant AS as Ephemeral Autoscaler
  participant OI as Oxide Infra
  box Oxide Instance
    participant ER as Ephemeral Runner
  end
  Dev->>CI: Commit code
  activate CI
  CI-->>CI: Trigger workflow
  CI->>AS: Send webhook (job queued)
  activate AS
  AS->>OI: Request to provision ephemeral runner
  activate OI
  OI->>ER: Provision ephemeral runner
  activate ER
  OI-->>AS: Ephemeral runner provisioned
  deactivate OI
  ER->>CI: Request job details
  CI->>ER: Respond with job details
  ER-->>ER: Clone repository
  ER-->>ER: Execute workflow job
  ER->>CI: Report job status
  CI->>Dev: Notify completion
  CI->>AS: Notify completion
  deactivate CI
  note over AS,OI: Cleanup
  AS->>OI: Request to destroy ephemeral runner
  activate OI
  OI-->>ER: Destroy ephemeral runner
  deactivate ER
  OI-->>AS: Ephemeral runner destroyed
  deactivate OI
  deactivate AS`,
  },
  {
    title: 'CI/CD fan-out',
    source: `flowchart LR
  P{CI/CD Platform}
  subgraph oxide [Oxide]
    R1[CI/CD Runner]
    R2[CI/CD Runner]
    R3[CI/CD Runner]
  end
  P -- Run job --> R1
  P -- Run job --> R2
  P -- Run job --> R3`,
  },
  {
    title: 'Index collision',
    source: `flowchart TB
  subgraph keys [" "]
    K0["key=0<br>index=0"]:::destructive
    K1["key=1<br>index=1"]
    K3["key=3<br>index=3"]
    K4["key=4<br>index=4"]
    K1000["key=1000<br>index=0"]:::destructive
  end
  subgraph slots [" "]
    S0["[0]<br>Occupied<br>(key=1000)"]:::destructive
    S1["[1]<br>Occupied(key=1)"]:::success
    S2["[2]<br>Occupied(key=2)<br>(orphaned)"]
    S3["[3]<br>Occupied(key=3)"]:::success
    S4["[4]<br>Occupied(key=4)"]:::success
  end
  K0 --> S0
  K1 --> S1
  K3 ~~~ S2
  K3 --> S3
  K4 --> S4
  K1000 --> S0`,
  },
  {
    title: 'Index aligned',
    source: `flowchart TB
  subgraph keys [" "]
    K0["key=0<br>index=0"]
    K1["key=1<br>index=1"]
    K2["key=2<br>index=2"]
    K3["key=3<br>index=3"]
    K4["key=4<br>index=4"]
  end
  subgraph slots [" "]
    S0["[0]<br>Occupied(key=0)"]:::success
    S1["[1]<br>Occupied(key=1)"]:::success
    S2["[2]<br>Occupied(key=2)"]:::success
    S3["[3]<br>Occupied(key=3)"]:::success
    S4["[4]<br>Occupied(key=4)"]:::success
  end
  K0 --> S0
  K1 --> S1
  K2 --> S2
  K3 --> S3
  K4 --> S4`,
  },
  {
    title: 'Free list',
    source: `flowchart TB
  subgraph hashes [" "]
    H1["hash(k₁) → 0"]
    H0["hash(k₀) → 3"]
    H2["hash(k₂) → 4"]
  end
  subgraph slots [" "]
    T0["[0]<br>Occupied(t₁)"]:::success
    T1["[1]<br>Vacant<br>next: SENT"]:::notice
    T2["[2]<br>Vacant<br>next: 1"]:::notice
    T3["[3]<br>Occupied(t₀)"]:::success
    T4["[4]<br>Occupied(t₂)"]:::success
  end
  H1 --> T0
  H1 ~~~ T1
  H0 ~~~ T2
  H0 --> T3
  H2 --> T4
  T2 ~~~ FH[free_head = 2]
  FH --> T2`,
  },
  {
    title: 'Silos and IdP',
    source: `flowchart LR
  subgraph rack [Oxide Rack]
    REC["Silo: “Recovery”<br>IdP config: local-only<br>• “Recovery” (password set during rack setup)"]
    PROD["Silo: “Prod”<br>IdP config: SAML (IdP id 1)<br>• Alice @ IdP 1 [Okta “Prod” app]<br>• Bart @ IdP 1 [Okta “Prod” app]"]
    DEV["Silo: “Dev”<br>IdP config: SAML (IdP id 2)<br>• Alice @ IdP 2 [Okta “Dev” app]<br>• Carol @ IdP 2 [Okta “Dev” app]"]
  end
  subgraph idp ["Identity Provider (e.g., Okta)"]
    subgraph apps [Apps/integration]
      AP[Oxide Rack: Prod]
      AV[Oxide Rack: Dev]
    end
    subgraph users [Users]
      Alice
      Bart
      Carol
      Oscar
    end
  end
  PROD -- "IdP integration (SAML)" --> AP
  DEV --> AV
  AP --- Alice & Bart
  AV --- Alice & Carol`,
  },
  {
    title: 'Object store cluster',
    source: `flowchart TB
  C[Clients / S3 SDK / curl]
  subgraph rack [Oxide Rack]
    FIP["Floating IP :443"]
    subgraph lb [" "]
      direction LR
      LB1["lb-1 · 192.0.2.11<br>active / ready / sled 3"]:::success
      LB2["lb-2 · 192.0.2.12<br>standby / ready / sled 5"]
      LB1 <-. "health check" .-> LB2
    end
    subgraph store ["Object store, erasure coded across 16 local drives"]
      M1["store-1 · 192.0.2.21<br>4 local × 200 GiB"]
      M2["store-2 · 192.0.2.22<br>4 local × 200 GiB"]
      M3["store-3 · 192.0.2.23<br>4 local × 200 GiB"]
      M4["store-4 · 192.0.2.24<br>4 local × 200 GiB"]
    end
    FIP --> lb
    lb -- "HTTPS :9000 round-robin" --> store
  end
  C -- "HTTPs :443" --> FIP
  style rack stroke-dasharray: 4 4`,
  },
  {
    title: 'Hosted workers',
    source: `flowchart RL
  subgraph infra ["Your infrastructure · no inbound ports"]
    P[worker provider]
    O1((worker))
    O2((worker))
    O3((worker))
  end
  subgraph svc [service.example.com]
    T1[job]
    T2[job]
    T3[job]
  end
  P -->|"1. opens a connection"| svc
  svc -. "2. sends events" .-> P
  P -- "3. spawns a worker per job" --> O1
  P --> O2
  P --> O3
  O1 -- "4. workers connect back" --> T1
  O2 --> T2
  O3 --> T3`,
  },
]

// same markup the RFD site's Listing renders around Mermaid
export function MermaidBlock({ source }: { source: string }) {
  const [highlighted, setHighlighted] = useState<string>()
  useEffect(() => {
    let cancelled = false
    // inline, as handleDocument does, since we're already inside a <pre>
    highlightCode(source, 'mermaid', { inline: true }).then((html) => {
      if (!cancelled) setHighlighted(html)
    })
    return () => {
      cancelled = true
    }
  }, [source])

  return (
    <div className="asciidoc-body">
      <div className="listingblock">
        <div className="content">
          <pre className="highlight">
            <Mermaid content={source} highlighted={highlighted} />
          </pre>
        </div>
      </div>
    </div>
  )
}

export function DiagramShowcase() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 p-8">
      {diagrams.map((d) => (
        <section key={d.title}>
          <h2 className="text-mono-sm text-secondary mb-2">{d.title}</h2>
          <MermaidBlock source={d.source} />
        </section>
      ))}
    </div>
  )
}
