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
const Add12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M6.75.667A.667.667 0 0 0 6.083 0h-.166a.667.667 0 0 0-.667.667V5.25H.667A.667.667 0 0 0 0 5.917v.166c0 .368.299.667.667.667H5.25v4.583c0 .368.299.667.667.667h.166a.667.667 0 0 0 .667-.667V6.75h4.583A.667.667 0 0 0 12 6.083v-.166a.667.667 0 0 0-.667-.667H6.75V.667Z" fill="currentColor" /></svg>;
export default Add12Icon;