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
const SoftwareUpdate24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M12.707 1.707a1 1 0 0 0-1.414 0L7.707 5.293C7.077 5.923 7.523 7 8.414 7h7.172c.89 0 1.337-1.077.707-1.707l-3.586-3.586ZM2 11a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V11Zm9.293 2.707a1 1 0 0 1 1.414 0l3.586 3.586c.63.63.184 1.707-.707 1.707H8.414c-.89 0-1.337-1.077-.707-1.707l3.586-3.586Z" fill="currentColor" /></svg>;
export default SoftwareUpdate24Icon;