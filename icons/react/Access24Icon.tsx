import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Access24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M3 4.72a1 1 0 0 1 .684-.948l8-2.667a1 1 0 0 1 .632 0l8 2.667a1 1 0 0 1 .684.949v8.572a8 8 0 0 1-4.115 6.993l-4.4 2.444a1 1 0 0 1-.97 0l-4.4-2.444A8 8 0 0 1 3 13.293V4.72ZM7 15a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1.434a1 1 0 0 1-.485.857l-4 2.4a1 1 0 0 1-1.03 0l-4-2.4A1 1 0 0 1 7 16.434V15Zm5-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#A1A4A5" /></svg>;
export default Access24Icon;