import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Disabled12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM3.167 6.75a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h5.666c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667H3.167Z" fill="#B8BBBC" /></svg>;
export default Disabled12Icon;