import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Security12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M4 5h4V4a2 2 0 1 0-4 0v1ZM2 5h-.333A.667.667 0 0 0 1 5.667v5.666c0 .368.299.667.667.667h8.666a.667.667 0 0 0 .667-.667V5.667A.667.667 0 0 0 10.333 5H10V4a4 4 0 1 0-8 0v1Z" fill="#B8BBBC" /></svg>;
export default Security12Icon;