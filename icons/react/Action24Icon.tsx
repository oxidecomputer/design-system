import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Action24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M14 11h5.863a.5.5 0 0 1 .369.838l-9.363 10.214a.5.5 0 0 1-.869-.337V13H4.137a.5.5 0 0 1-.369-.838l9.363-10.214a.5.5 0 0 1 .869.337V11Z" fill="currentColor" /></svg>;
export default Action24Icon;