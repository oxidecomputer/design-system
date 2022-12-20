import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const NextArrow12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/next-arrow">
      <path
        id="Union"
        d="M3.46968 1.46966C3.76257 1.17677 4.23744 1.17677 4.53034 1.46966L8.53034 5.46966C8.82323 5.76255 8.82323 6.23743 8.53034 6.53032L4.53034 10.5303C4.23744 10.8232 3.76257 10.8232 3.46968 10.5303C3.17678 10.2374 3.17678 9.76256 3.46968 9.46966L6.93935 5.99999L3.46968 2.53032C3.17678 2.23743 3.17678 1.76255 3.46968 1.46966Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default NextArrow12Icon
