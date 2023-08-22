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
const Folder16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M1.75 2h6.773a.75.75 0 0 1 .75.75v1.16H1V2.75A.75.75 0 0 1 1.75 2ZM1 5h13.25a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V5Z" fill="currentColor" /></svg>;
export default Folder16Icon;