interface Person24IconProps {
  className?: string
  title: string
}

export const Person24Icon = ({ className = '', title }: Person24IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M18 8A6 6 0 1 1 6 8a6 6 0 0 1 12 0ZM1 21.454A5.455 5.455 0 0 1 6.455 16h11.09A5.455 5.455 0 0 1 23 21.454a.545.545 0 0 1-.546.546H1.546A.545.545 0 0 1 1 21.454Z"
      fill="currentColor"
    />
  </svg>
)
