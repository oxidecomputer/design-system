import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Settings24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M2 7.091a1 1 0 0 1 .518-.876l9-4.95a1 1 0 0 1 .964 0l9 4.95a1 1 0 0 1 .518.876v9.818a1 1 0 0 1-.518.876l-9 4.95a1 1 0 0 1-.964 0l-9-4.95A1 1 0 0 1 2 16.909V7.09ZM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="#A1A4A5" /></svg>;
export default Settings24Icon;