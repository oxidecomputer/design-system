import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const SoftwareUpdate24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/software-update">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9896 11.4115C19.9965 11.2752 20 11.138 20 11C20 6.58172 16.4183 3 12 3C8.00782 3 4.69862 5.9242 4.09747 9.74752C2.25045 10.7704 1 12.7392 1 15C1 18.3137 3.68629 21 7 21H18C20.7614 21 23 18.7614 23 16C23 13.9457 21.7611 12.1807 19.9896 11.4115ZM14 9V13L15.7929 13C16.2383 13 16.4614 13.5386 16.1464 13.8536L12.7071 17.2929C12.3166 17.6834 11.6834 17.6834 11.2929 17.2929L7.85354 13.8536C7.53856 13.5386 7.76164 13 8.20709 13L9.99999 13L9.99999 9C9.99999 8.44772 10.4477 8 11 8H13C13.5523 8 14 8.44772 14 9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default SoftwareUpdate24Icon
