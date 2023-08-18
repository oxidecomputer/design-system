import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Clipboard16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M6.75 1a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75v-.5A.75.75 0 0 0 9.25 1h-2.5Zm-4 1H4v2.25c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75V2h1.25a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V2.75A.75.75 0 0 1 2.75 2Z" fill="#A1A4A5" /></svg>;
export default Clipboard16Icon;