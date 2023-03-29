interface Compatibility24IconProps {
  className?: string
  title: string
}

export const Compatibility24Icon = ({
  className = '',
  title,
}: Compatibility24IconProps) => (
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
      d="M2 3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v8h-6V7H8v4H2V3Zm14 10v4h6v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4h6v-4h8Z"
      fill="currentColor"
    />
  </svg>
)
