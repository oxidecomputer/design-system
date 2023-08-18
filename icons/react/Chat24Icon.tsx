import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Chat24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12v9.048c0 .526.426.952.952.952H12c5.523 0 10-4.477 10-10S17.523 2 12 2Zm-6 8a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z" fill="#A1A4A5" /></svg>;
export default Chat24Icon;