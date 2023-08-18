import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Time16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM7 3.75A.75.75 0 0 1 7.75 3h.5a.75.75 0 0 1 .75.75V7h2.25a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 7 8.25v-4.5Z" fill="currentColor" /></svg>;
export default Time16Icon;