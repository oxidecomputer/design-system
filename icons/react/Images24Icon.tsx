import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const Images24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M11.499 11.71a1 1 0 0 0 1.002 0l8.252-4.777a.5.5 0 0 0 0-.866L12.5 1.29a1 1 0 0 0-1.002 0L3.247 6.067a.5.5 0 0 0 0 .866L11.5 11.71ZM11 14.088a1 1 0 0 0-.514-.874L2.743 8.913A.5.5 0 0 0 2 9.35v8.062a1 1 0 0 0 .514.874l7.743 4.301A.5.5 0 0 0 11 22.15v-8.062Zm2 0a1 1 0 0 1 .514-.874l7.743-4.301A.5.5 0 0 1 22 9.35v8.062a1 1 0 0 1-.514.874l-7.743 4.301A.5.5 0 0 1 13 22.15v-8.062Z" fill="currentColor" /></svg>;
export default Images24Icon;