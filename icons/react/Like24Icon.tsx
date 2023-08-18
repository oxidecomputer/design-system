import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Like24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M12.563 2.512 7 9.018V22h10.323a1 1 0 0 0 .928-.629L22 12v-.982a2 2 0 0 0-2-2h-5.571l1.098-4.207a2 2 0 0 0-1.302-2.403l-.586-.195a1 1 0 0 0-1.076.299ZM2.75 9a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75H5V9H2.75Z" fill="#A1A4A5" /></svg>;
export default Like24Icon;