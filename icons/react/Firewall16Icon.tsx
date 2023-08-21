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
const Firewall16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M0 .75A.75.75 0 0 1 .75 0h5.5A.75.75 0 0 1 7 .75v1.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 2.25V.75Zm0 13A.75.75 0 0 1 .75 13h5.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-1.5ZM9.75 13a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-5.5ZM0 5.75A.75.75 0 0 1 .75 5h1.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-4.5ZM13.75 5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-1.5ZM9 .75A.75.75 0 0 1 9.75 0h5.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-5.5A.75.75 0 0 1 9 2.25V.75ZM7.796 11.867c.124.081.284.081.408 0l1.196-.776c1-.691 1.6-1.855 1.6-3.127V5.375A.375.375 0 0 0 10.625 5h-5.25A.375.375 0 0 0 5 5.375v2.589c0 1.272.6 2.472 1.6 3.127l1.196.776Z" fill="currentColor" /></svg>;
export default Firewall16Icon;