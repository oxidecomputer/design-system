import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Repair12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={12} height={12} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M5.646 7.646a4 4 0 0 1-5.58-4.375c.085-.458.64-.565.97-.236l1.728 1.73c.13.13.342.13.472 0l1.528-1.53a.333.333 0 0 0 0-.47l-1.729-1.73c-.33-.33-.222-.884.237-.969a4 4 0 0 1 4.375 5.58l3.881 3.882c.26.26.26.683 0 .944l-1.056 1.056a.667.667 0 0 1-.944 0L5.646 7.646Z" fill="currentColor" /></svg>;
export default Repair12Icon;