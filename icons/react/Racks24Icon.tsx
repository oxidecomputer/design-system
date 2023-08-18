import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Racks24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M3 2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3Zm6 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM3 13a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H3Zm6 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" fill="#A1A4A5" /></svg>;
export default Racks24Icon;