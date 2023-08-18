import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Instances16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M6 1.75A.75.75 0 0 1 6.75 1h7.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H13V3.75a.75.75 0 0 0-.75-.75H6V1.75Zm-5 4A.75.75 0 0 1 1.75 5h8.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-8.5Z" fill="currentColor" /></svg>;
export default Instances16Icon;