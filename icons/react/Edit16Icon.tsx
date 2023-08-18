import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Edit16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M.75 16a.75.75 0 0 1-.75-.75v-2.94a.75.75 0 0 1 .22-.53l8.25-8.25a.75.75 0 0 1 1.06 0l2.94 2.94a.75.75 0 0 1 0 1.06l-8.25 8.25a.75.75 0 0 1-.53.22H.75ZM13.47 5.47a.75.75 0 0 0 1.06 0l.94-.94a.75.75 0 0 0 0-1.06L12.53.53a.75.75 0 0 0-1.06 0l-.94.94a.75.75 0 0 0 0 1.06l2.94 2.94Z" fill="currentColor" /></svg>;
export default Edit16Icon;