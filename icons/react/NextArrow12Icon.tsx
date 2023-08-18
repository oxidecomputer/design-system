import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const NextArrow12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M3.47 1.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06-1.06L6.94 6 3.47 2.53a.75.75 0 0 1 0-1.06Z" fill="currentColor" /></svg>;
export default NextArrow12Icon;