import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const DirectionRightIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path d="M8.807 6.597a.667.667 0 0 0 0-1.194l-5.842-2.92A.667.667 0 0 0 2 3.079v5.842c0 .496.522.818.965.596l5.842-2.92Z" fill="#B8BBBC" /></svg>;
export default DirectionRightIcon;