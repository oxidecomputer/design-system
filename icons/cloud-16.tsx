interface Cloud16IconProps {
  className?: string
  title: string
}

export const Cloud16Icon = ({ className = '', title }: Cloud16IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.333 7v.018A3 3 0 0 1 13 13H4a4 4 0 0 1-.254-7.992A5.001 5.001 0 0 1 13.333 7Z"
      fill="currentColor"
    />
  </svg>
)
