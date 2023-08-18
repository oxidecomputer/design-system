import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Contrast16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm2.296-2.457A6 6 0 0 1 8 14V2a6 6 0 0 1 2.296 11.543Z" fill="currentColor" /></svg>;
export default Contrast16Icon;