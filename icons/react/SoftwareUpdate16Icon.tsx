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
const SoftwareUpdate16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M8.53 1.53a.75.75 0 0 0-1.06 0L5.28 3.72A.75.75 0 0 0 5.81 5h4.38a.75.75 0 0 0 .53-1.28L8.53 1.53ZM1 7.75A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75v-6.5Zm6.47 1.78a.75.75 0 0 1 1.06 0l2.19 2.19a.75.75 0 0 1-.53 1.28H5.81a.75.75 0 0 1-.53-1.28l2.19-2.19Z" fill="currentColor" /></svg>;
export default SoftwareUpdate16Icon;