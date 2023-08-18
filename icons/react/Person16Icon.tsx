import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Person16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M12 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM1 14.368A3.368 3.368 0 0 1 4.368 11h7.264A3.368 3.368 0 0 1 15 14.368a.632.632 0 0 1-.632.632H1.632A.632.632 0 0 1 1 14.368Z" fill="#A1A4A5" /></svg>;
export default Person16Icon;