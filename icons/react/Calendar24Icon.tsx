import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Calendar24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 0 0-1 1v3h20V6a1 1 0 0 0-1-1h-2V2h-3v3H8V2H5v3H3Zm-1 6h20v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V11Zm3 3h5v5H5v-5Z" fill="#A1A4A5" /></svg>;
export default Calendar24Icon;