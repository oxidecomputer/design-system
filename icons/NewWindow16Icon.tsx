import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const NewWindow16Icon = ({
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
    <g id="16/new-window">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.75 1H14.25C14.6642 1 15 1.33579 15 1.75V10.25C15 10.6642 14.6642 11 14.25 11H5.75C5.33579 11 5 10.6642 5 10.25V1.75C5 1.33579 5.33579 1 5.75 1ZM7.75 3C7.33579 3 7 3.33579 7 3.75V4.25C7 4.66421 7.33579 5 7.75 5H12.25C12.6642 5 13 4.66421 13 4.25V3.75C13 3.33579 12.6642 3 12.25 3H7.75Z"
        fill="#A1A4A5"
      />
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5H1.75C1.33579 5 1 5.33579 1 5.75V14.25C1 14.6642 1.33579 15 1.75 15H10.25C10.6642 15 11 14.6642 11 14.25V12H9V13H3V7H4V5Z"
        fill="#A1A4A5"
      />
    </g>
  </svg>
)
export default NewWindow16Icon