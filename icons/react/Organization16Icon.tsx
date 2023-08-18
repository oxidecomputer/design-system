import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Organization16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M7.47.53a.75.75 0 0 1 1.06 0l2.273 2.273a.75.75 0 0 1 0 1.06L8.53 6.137a.75.75 0 0 1-1.06 0L5.197 3.864a.75.75 0 0 1 0-1.061L7.47.53Zm8 8a.75.75 0 0 0 0-1.06l-2.273-2.273a.75.75 0 0 0-1.06 0L9.863 7.47a.75.75 0 0 0 0 1.06l2.272 2.273a.75.75 0 0 0 1.061 0L15.47 8.53Zm-4.667 4.667a.75.75 0 0 0 0-1.06L8.53 9.863a.75.75 0 0 0-1.06 0l-2.273 2.272a.75.75 0 0 0 0 1.061L7.47 15.47a.75.75 0 0 0 1.06 0l2.273-2.273ZM6.136 8.53a.75.75 0 0 0 0-1.06L3.864 5.197a.75.75 0 0 0-1.061 0L.53 7.47a.75.75 0 0 0 0 1.06l2.273 2.273a.75.75 0 0 0 1.06 0L6.137 8.53Z" fill="currentColor" /></svg>;
export default Organization16Icon;