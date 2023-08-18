import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Gateway24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M4 1h16a1 1 0 0 1 1 1v20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Zm6.306 5.246a.5.5 0 0 0-.306.46v10.32a.5.5 0 0 0 .292.454l7 3.197a.5.5 0 0 0 .708-.455V3.754a.5.5 0 0 0-.694-.461l-7 2.953Z" fill="#A1A4A5" /></svg>;
export default Gateway24Icon;