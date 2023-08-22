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
const Document24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M16.293 1.293A1 1 0 0 0 15.586 1H4a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6.414a1 1 0 0 0-.293-.707l-4.414-4.414ZM6 12a1 1 0 0 1 1-1h7a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm11 4a1 1 0 0 1-1 1H7a1 1 0 1 1 0-2h9a1 1 0 0 1 1 1Zm1-8a1 1 0 0 1-1 1H7a1 1 0 0 1 0-2h10a1 1 0 0 1 1 1Z" fill="currentColor" /></svg>;
export default Document24Icon;