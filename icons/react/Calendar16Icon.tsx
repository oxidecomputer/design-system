import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Calendar16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M1.75 3a.75.75 0 0 0-.75.75V6h14V3.75a.75.75 0 0 0-.75-.75H13V1h-2v2H5V1H3v2H1.75ZM1 7h14v7.25a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V7Zm2 2.75A.75.75 0 0 1 3.75 9h2.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-2.5Z" fill="#A1A4A5" /></svg>;
export default Calendar16Icon;