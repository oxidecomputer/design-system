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
const Transmit24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M18.363 13.84c-.336.439-.336 1.07.059 1.456.394.387 1.03.384 1.377-.046A9.946 9.946 0 0 0 22 8.995c0-2.366-.823-4.54-2.199-6.252-.345-.43-.983-.434-1.377-.047s-.395 1.017-.06 1.456A7.954 7.954 0 0 1 20 8.995c0 1.821-.61 3.5-1.637 4.845Zm-12.726 0c.336.439.336 1.07-.059 1.456-.394.387-1.03.384-1.377-.046A9.946 9.946 0 0 1 2 8.995c0-2.366.823-4.54 2.199-6.252.346-.43.983-.434 1.377-.047s.394 1.017.06 1.456A7.953 7.953 0 0 0 4 8.995c0 1.821.61 3.5 1.637 4.845Zm1.444-1.412c.316.452.957.454 1.351.068.395-.387.387-1.017.108-1.495A3.974 3.974 0 0 1 8 8.995c0-.73.196-1.416.54-2.006.278-.477.285-1.107-.11-1.494-.393-.386-1.034-.384-1.35.068A5.965 5.965 0 0 0 6 8.995c0 1.277.4 2.46 1.08 3.434Zm8.487.068c.394.386 1.035.384 1.351-.068A5.965 5.965 0 0 0 18 8.995c0-1.277-.4-2.46-1.08-3.432-.316-.452-.957-.454-1.35-.068-.395.387-.388 1.017-.11 1.494.343.59.54 1.275.54 2.006 0 .731-.197 1.417-.54 2.007-.279.477-.287 1.107.108 1.494ZM14 9a2 2 0 0 1-1.412 1.912l3.014 9.794A1 1 0 0 1 14.646 22H9.354a1 1 0 0 1-.956-1.294l3.014-9.794A2 2 0 1 1 14 9Z" fill="currentColor" /></svg>;
export default Transmit24Icon;