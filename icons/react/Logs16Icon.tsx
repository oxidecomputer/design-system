import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Logs16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M.75 3a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75H1v4.25c0 .414.336.75.75.75H6v-2H3V7h.25A.75.75 0 0 0 4 6.25v-2.5A.75.75 0 0 0 3.25 3H.75Zm6 0a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75h-8.5ZM6 9.75A.75.75 0 0 1 6.75 9h8.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-2.5Z" fill="#A1A4A5" /></svg>;
export default Logs16Icon;