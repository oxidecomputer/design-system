import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Show16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M.184 7.674C.852 6.563 3.357 3 8 3s7.148 3.563 7.816 4.674a.63.63 0 0 1 0 .652C15.148 9.437 12.643 13 8 13S.852 9.437.184 8.326a.63.63 0 0 1 0-.652ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" /></svg>;
export default Show16Icon;