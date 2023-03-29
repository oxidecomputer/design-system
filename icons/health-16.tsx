interface Health16IconProps {
  className?: string
  title: string
}

export const Health16Icon = ({ className = '', title }: Health16IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3.228a4.05 4.05 0 0 1 5.793 0c1.61 1.626 1.61 4.292 0 5.918l-5.257 5.312a.75.75 0 0 1-1.069-.003l-5.26-5.374c-1.61-1.626-1.61-4.292 0-5.918A4.108 4.108 0 0 1 8 3.228Z"
      fill="currentColor"
    />
  </svg>
)
