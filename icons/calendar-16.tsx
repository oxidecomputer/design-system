interface Calendar16IconProps {
  className?: string
  title: string
}

export const Calendar16Icon = ({ className = '', title }: Calendar16IconProps) => (
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
      d="M1.75 3a.75.75 0 0 0-.75.75V6h14V3.75a.75.75 0 0 0-.75-.75H13V1h-2v2H5V1H3v2H1.75ZM1 7h14v7.25a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V7Zm2 2.75A.75.75 0 0 1 3.75 9h2.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-2.5Z"
      fill="currentColor"
    />
  </svg>
)
