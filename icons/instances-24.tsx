interface Instances24IconProps {
  className?: string
  title: string
}

export const Instances24Icon = ({ className = '', title }: Instances24IconProps) => (
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
      d="M7 3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2V6a1 1 0 0 0-1-1H7V3ZM3 7h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
      fill="currentColor"
    />
  </svg>
)
