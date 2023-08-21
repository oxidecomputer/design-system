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
const Search16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.524 4.89a6 6 0 1 1 1.414-1.414l2.287 2.287a.75.75 0 0 1 0 1.06l-.354.354a.75.75 0 0 1-1.06 0l-2.287-2.286Z" fill="currentColor" /></svg>;
export default Search16Icon;