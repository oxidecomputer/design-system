import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Overview16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/overview">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1.75C7 1.33579 6.66421 1 6.25 1H1.75C1.33579 1 1 1.33579 1 1.75V8.25C1 8.66421 1.33579 9 1.75 9H6.25C6.66421 9 7 8.66421 7 8.25V1.75ZM15 1.75C15 1.33579 14.6642 1 14.25 1H9.75C9.33579 1 9 1.33579 9 1.75V4.25C9 4.66421 9.33579 5 9.75 5H14.25C14.6642 5 15 4.66421 15 4.25V1.75ZM1 11.75C1 11.3358 1.33579 11 1.75 11H6.25C6.66421 11 7 11.3358 7 11.75V14.25C7 14.6642 6.66421 15 6.25 15H1.75C1.33579 15 1 14.6642 1 14.25V11.75ZM15 7.75C15 7.33579 14.6642 7 14.25 7H9.75C9.33579 7 9 7.33579 9 7.75V14.25C9 14.6642 9.33579 15 9.75 15H14.25C14.6642 15 15 14.6642 15 14.25V7.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Overview16Icon