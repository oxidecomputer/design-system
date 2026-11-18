/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { MermaidBlock } from './DiagramShowcase'
// From https://pele.run/examples (MIT, Copyright (c) 2026 kepano)
import examples from './pele-examples.json'

export function PeleExamplesShowcase() {
  const byType = Map.groupBy(examples, (d) => d.type)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 p-8">
      <p className="text-sans-md text-secondary">
        {examples.length} examples from{' '}
        <a href="https://pele.run/examples" className="underline">
          pele.run/examples
        </a>
        , covering {byType.size} diagram types
      </p>
      {[...byType].map(([type, diagrams]) => (
        <section key={type} className="flex flex-col gap-6">
          <h2 className="text-sans-xl text-raise">{type}</h2>
          {diagrams.map((d, i) => (
            <MermaidBlock key={i} source={d.source} />
          ))}
        </section>
      ))}
    </div>
  )
}
