import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const DirectionDownIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M5.403 8.807a.667.667 0 0 0 1.194 0l2.92-5.842A.667.667 0 0 0 8.921 2H3.079a.667.667 0 0 0-.596.965l2.92 5.842Z" fill="#B8BBBC" /></svg>;
export default DirectionDownIcon;