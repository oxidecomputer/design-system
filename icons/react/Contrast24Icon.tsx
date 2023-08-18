import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Contrast24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm2.679-3.533c-.85.352-1.76.533-2.679.533V5a7 7 0 0 1 2.679 13.467Z" fill="#A1A4A5" /></svg>;
export default Contrast24Icon;