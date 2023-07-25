/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type AdocTypes, Table as InnerTable } from '@oxide/react-asciidoc'

const Table = ({ node }: { node: AdocTypes.Table }) => (
  <div className="table-wrapper">
    <InnerTable node={node} />
  </div>
)

export default Table
