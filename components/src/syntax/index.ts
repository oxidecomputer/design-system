/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * Syntax highlighting assets shared with other Oxide apps (e.g. the console's
 * OxQL editor): TextMate grammars and the Oxide shiki theme. Exported from
 * their own entry point so consumers can highlight code without pulling in
 * the asciidoc renderer and its dependencies. The exports are deliberately
 * untyped (plain JSON shapes) so consumers on any shiki major can use them as
 * `LanguageRegistration` / `ThemeRegistrationAny`.
 */

import oxqlGrammar from './langs/oxql.tmLanguage.json'
// p4.tmLanguage.json is derived from the highlights query in
// https://github.com/oxidecomputer/tree-sitter-p4 (queries/highlights.scm).
import p4Grammar from './langs/p4.tmLanguage.json'
import oxideTheme from './oxide-syntax.json'

export { oxideTheme, oxqlGrammar, p4Grammar }
