/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { BundledLanguage } from 'shiki'
import { describe, expect, it } from 'vitest'

import { getHighlighter } from '../components/src/asciidoc/util'
import { oxideTheme } from '../components/src/syntax'

/**
 * Tokenize OxQL and return each non-whitespace token with its innermost scope.
 * Uses the same highlighter the asciidoc renderer uses, so this tests the real
 * grammar registration.
 */
async function tokenize(code: string): Promise<[string, string][]> {
  const h = await getHighlighter()
  return h
    .codeToTokensBase(code, {
      // custom language, so not in shiki's BundledLanguage union
      lang: 'oxql' as BundledLanguage,
      theme: oxideTheme,
      includeExplanation: true,
    })
    .flat()
    .flatMap((token) => token.explanation ?? [])
    .filter((e) => e.content.trim())
    .map((e) => [e.content.trim(), e.scopes.at(-1)!.scopeName])
}

/**
 * Assert that `code` is covered by tokens with the given scope. Usually that's
 * one token, but a string's quotes and contents come out as separate tokens.
 */
async function expectScope(code: string, scope: string) {
  const tokens = await tokenize(code)
  expect(tokens.map(([text]) => text).join('')).toEqual(code)
  expect(new Set(tokens.map(([, s]) => s))).toEqual(new Set([scope]))
}

describe('literals', () => {
  it.each(['5s', '5m', '1h', '7d', '2w', '3M', '1Y', '500ms', '10us', '100ns'])(
    'duration %s',
    (code) => expectScope(code, 'constant.numeric.duration.oxql'),
  )

  it.each([
    '@2024-01-01',
    '@2024-01-01T12:30:00',
    '@2024-01-01T12:30:00.123',
    '@12:30:00',
    '@12:30:00.5',
  ])('timestamp %s', (code) => expectScope(code, 'constant.numeric.datetime.oxql'))

  it('@now()', () => expectScope('@now()', 'constant.numeric.function.oxql'))

  it.each(['0', '42'])('integer %s', (code) =>
    expectScope(code, 'constant.numeric.integer.oxql'),
  )

  it.each(['0x1f', '0xDEADbeef'])('hex integer %s', (code) =>
    expectScope(code, 'constant.numeric.hex.oxql'),
  )

  it.each(['1.5', '1.', '.5', '1e3', '1.5e3', '2.5E-4'])('float %s', (code) =>
    expectScope(code, 'constant.numeric.float.oxql'),
  )

  it.each(['true', 'false'])('boolean %s', (code) =>
    expectScope(code, 'constant.language.boolean.oxql'),
  )

  it.each([
    ['"net0"', 'string.quoted.double.oxql'],
    ["'net0'", 'string.quoted.single.oxql'],
  ])('string %s', (code, scope) => expectScope(code, scope))
})

describe('operators', () => {
  it.each(['==', '!=', '>=', '>', '<=', '<', '~='])('comparison %s', async (op) => {
    expect(await tokenize(`x ${op} 1`)).toContainEqual([
      op,
      'keyword.operator.comparison.oxql',
    ])
  })

  it.each(['||', '&&', '^'])('logical %s', async (op) => {
    expect(await tokenize(`x == 1 ${op} y == 2`)).toContainEqual([
      op,
      'keyword.operator.logical.oxql',
    ])
  })

  it('negation', async () => {
    expect(await tokenize('!(x == 1)')).toContainEqual([
      '!',
      'keyword.operator.logical.oxql',
    ])
  })
})

describe('table operations', () => {
  it.each(['get', 'filter', 'align', 'group_by', 'join', 'first', 'last'])(
    'keyword %s',
    (code) => expectScope(code, 'keyword.control.oxql'),
  )

  it.each(['mean_within', 'interpolate', 'mean', 'sum'])('function %s', (code) =>
    expectScope(code, 'support.function.oxql'),
  )
})

it('full query', async () => {
  const query = `{ get a:b; get c:d } | join
    | filter timestamp > @now() - 1h && !(link_name == "net0" || x ~= 'y')
    | align mean_within(500ms)
    | group_by [sled_serial, link_name], sum
    | last 10`
  const lines = (await tokenize(query)).map(
    ([text, scope]) => `${text.padEnd(12)} ${scope}`,
  )
  expect(lines.join('\n')).toMatchInlineSnapshot(`
    "{            punctuation.section.brackets.oxql
    get          keyword.control.oxql
    a:b          source.oxql
    ;            punctuation.separator.oxql
    get          keyword.control.oxql
    c:d          source.oxql
    }            punctuation.section.brackets.oxql
    |            keyword.operator.oxql
    join         keyword.control.oxql
    |            keyword.operator.oxql
    filter       keyword.control.oxql
    timestamp    source.oxql
    >            keyword.operator.comparison.oxql
    @now()       constant.numeric.function.oxql
    -            source.oxql
    1h           constant.numeric.duration.oxql
    &&           keyword.operator.logical.oxql
    !            keyword.operator.logical.oxql
    (            punctuation.section.brackets.oxql
    link_name    source.oxql
    ==           keyword.operator.comparison.oxql
    "            string.quoted.double.oxql
    net0         string.quoted.double.oxql
    "            string.quoted.double.oxql
    ||           keyword.operator.logical.oxql
    x            source.oxql
    ~=           keyword.operator.comparison.oxql
    '            string.quoted.single.oxql
    y            string.quoted.single.oxql
    '            string.quoted.single.oxql
    )            punctuation.section.brackets.oxql
    |            keyword.operator.oxql
    align        keyword.control.oxql
    mean_within  support.function.oxql
    (            punctuation.section.brackets.oxql
    500ms        constant.numeric.duration.oxql
    )            punctuation.section.brackets.oxql
    |            keyword.operator.oxql
    group_by     keyword.control.oxql
    [            punctuation.section.brackets.oxql
    sled_serial  source.oxql
    ,            punctuation.separator.oxql
    link_name    source.oxql
    ]            punctuation.section.brackets.oxql
    ,            punctuation.separator.oxql
    sum          support.function.oxql
    |            keyword.operator.oxql
    last         keyword.control.oxql
    10           constant.numeric.integer.oxql"
  `)
})
