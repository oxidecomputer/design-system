import { SVGProps } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SelectArrows6Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg width={6} height={14} viewBox="0 0 6 14" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fillRule="evenodd" clipRule="evenodd" d="M3.322.536a.375.375 0 0 0-.644 0L.341 4.432C.19 4.682.37 5 .662 5h4.676a.375.375 0 0 0 .321-.568L3.322.536Zm-.644 12.928a.375.375 0 0 0 .644 0l2.337-3.896A.375.375 0 0 0 5.338 9H.662a.375.375 0 0 0-.321.568l2.337 3.896Z" fill="currentColor" /></svg>;
export default SelectArrows6Icon;