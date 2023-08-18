import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Error24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM7.447 9.613a.75.75 0 0 1 0-1.06l.884-.884a.75.75 0 0 1 1.06 0l2.387 2.387 2.387-2.387a.75.75 0 0 1 1.06 0l.884.884a.75.75 0 0 1 0 1.06L13.723 12l2.386 2.386a.75.75 0 0 1 0 1.061l-.884.884a.75.75 0 0 1-1.06 0l-2.387-2.386-2.386 2.386a.75.75 0 0 1-1.061 0l-.884-.884a.75.75 0 0 1 0-1.06L9.834 12 7.447 9.613Z" fill="currentColor" /></svg>;
export default Error24Icon;