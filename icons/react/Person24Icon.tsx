import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Person24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M18 8A6 6 0 1 1 6 8a6 6 0 0 1 12 0ZM1 21.454A5.455 5.455 0 0 1 6.455 16h11.09A5.455 5.455 0 0 1 23 21.454a.545.545 0 0 1-.546.546H1.546A.545.545 0 0 1 1 21.454Z" fill="#A1A4A5" /></svg>;
export default Person24Icon;