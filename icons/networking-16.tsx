interface Networking16IconProps {
  className?: string
  title: string
}

export const Networking16Icon = ({ className = '', title }: Networking16IconProps) => (
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
      d="M6.25 1h-4.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h4.5A.75.75 0 0 0 7 6.25v-4.5A.75.75 0 0 0 6.25 1Zm8 0h-4.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75Zm-4.5 8h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5A.75.75 0 0 1 9.75 9Zm-6.5 0h-.5a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H4V9.75A.75.75 0 0 0 3.25 9Z"
      fill="currentColor"
    />
  </svg>
)
