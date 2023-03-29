interface CaratDownIconProps {
  className?: string
  title: string
}

export const CaratDownIcon = ({ className = '', title }: CaratDownIconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.403 8.807a.667.667 0 0 0 1.194 0l2.92-5.842A.667.667 0 0 0 8.921 2H3.079a.667.667 0 0 0-.596.965l2.92 5.842Z"
      fill="currentColor"
    />
  </svg>
)
