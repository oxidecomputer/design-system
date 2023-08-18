import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const NewWindow16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M14.25 1h-8.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-8.5a.75.75 0 0 0-.75-.75ZM7 3.75A.75.75 0 0 1 7.75 3h4.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 7 4.25v-.5ZM1.75 5H4v2H3v6h6v-1h2v2.25a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-8.5A.75.75 0 0 1 1.75 5Z" fill="currentColor" /></svg>;
export default NewWindow16Icon;