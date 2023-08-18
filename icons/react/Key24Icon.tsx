import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Key24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M18.173 2.707a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1 0 1.414l-.233.233 1.232 1.232a1 1 0 0 1-1.414 1.414l-1.232-1.231-1.464 1.464 1.231 1.232a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414 0L15.06 10.06 13.623 11.5a6.5 6.5 0 1 1-2.359-1.884l6.909-6.908ZM8.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" fill="currentColor" /></svg>;
export default Key24Icon;