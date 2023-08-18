import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Unauthorized12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM4.472 8.528a.667.667 0 0 1-.944 0l-.056-.056a.667.667 0 0 1 0-.944l4.056-4.056c.26-.26.683-.26.944 0l.056.056c.26.26.26.683 0 .944L4.472 8.528Z" fill="currentColor" /></svg>;
export default Unauthorized12Icon;