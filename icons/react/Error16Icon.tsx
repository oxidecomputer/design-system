import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Error16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM4.995 6.409a.75.75 0 0 1 0-1.06l.353-.354a.75.75 0 0 1 1.061 0L8 6.585l1.591-1.59a.75.75 0 0 1 1.06 0l.354.353a.75.75 0 0 1 0 1.061L9.415 8l1.59 1.591a.75.75 0 0 1 0 1.06l-.353.354a.75.75 0 0 1-1.061 0L8 9.415l-1.591 1.59a.75.75 0 0 1-1.06 0l-.354-.353a.75.75 0 0 1 0-1.061L6.585 8l-1.59-1.591Z" fill="#A1A4A5" /></svg>;
export default Error16Icon;