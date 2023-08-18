import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Settings16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M8.372.213a.75.75 0 0 0-.744 0l-6.25 3.571A.75.75 0 0 0 1 4.435v7.13c0 .269.144.517.378.65l6.25 3.572a.75.75 0 0 0 .744 0l6.25-3.571a.75.75 0 0 0 .378-.651v-7.13a.75.75 0 0 0-.378-.65L8.372.212ZM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="currentColor" /></svg>;
export default Settings16Icon;