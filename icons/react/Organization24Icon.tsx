/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Organization24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<g fill="currentColor"><path d="M9.918 12.707a1 1 0 0 0 0-1.414L6.52 7.895a1 1 0 0 0-1.415 0l-3.398 3.398a1 1 0 0 0 0 1.414l3.398 3.398a1 1 0 0 0 1.415 0l3.398-3.398ZM22.293 12.707a1 1 0 0 0 0-1.414l-3.398-3.398a1 1 0 0 0-1.415 0l-3.398 3.398a1 1 0 0 0 0 1.414l3.398 3.398a1 1 0 0 0 1.415 0l3.398-3.398ZM11.293 1.707a1 1 0 0 1 1.414 0l3.398 3.398a1 1 0 0 1 0 1.415l-3.398 3.398a1 1 0 0 1-1.414 0L7.895 6.52a1 1 0 0 1 0-1.415l3.398-3.398ZM16.105 18.895a1 1 0 0 0 0-1.415l-3.398-3.398a1 1 0 0 0-1.414 0L7.895 17.48a1 1 0 0 0 0 1.415l3.398 3.398a1 1 0 0 0 1.414 0l3.398-3.398Z" /></g></svg>;
export default Organization24Icon;