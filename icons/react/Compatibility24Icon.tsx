import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Compatibility24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M2 3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v8h-6V7H8v4H2V3Zm14 10v4h6v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4h6v-4h8Z" fill="#A1A4A5" /></svg>;
export default Compatibility24Icon;