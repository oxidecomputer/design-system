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
const Email16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="m3.049 10 1.555-7h6.792l1.555 7H10.75a.75.75 0 0 0-.75.75v.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 0-.75-.75H3.049Zm-.18-8.413A.75.75 0 0 1 3.602 1h8.796a.75.75 0 0 1 .732.587l1.852 8.333a.748.748 0 0 1 .018.162v4.168a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75v-4.168a.75.75 0 0 1 .018-.162l1.851-8.333Z" fill="currentColor" /></svg>;
export default Email16Icon;