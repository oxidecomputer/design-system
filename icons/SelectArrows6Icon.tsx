import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const SelectArrows6Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={6}
    height={14}
    viewBox="0 0 6 14"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="6/select-arrows">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.32156 0.535933C3.17591 0.293181 2.82409 0.293181 2.67844 0.535933L0.340761 4.43207C0.190793 4.68201 0.370835 5 0.662321 5H5.33768C5.62916 5 5.80921 4.68201 5.65924 4.43206L3.32156 0.535933ZM2.67844 13.4641C2.82409 13.7068 3.17591 13.7068 3.32156 13.4641L5.65924 9.56794C5.80921 9.31799 5.62916 9 5.33768 9H0.662321C0.370836 9 0.190794 9.31799 0.340762 9.56794L2.67844 13.4641Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default SelectArrows6Icon