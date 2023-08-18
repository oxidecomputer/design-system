import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Cloud24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M20 11c0 .138-.003.275-.01.412A5.001 5.001 0 0 1 18 21H7A6 6 0 0 1 4.097 9.748 8 8 0 0 1 20 11Z" fill="#A1A4A5" /></svg>;
export default Cloud24Icon;