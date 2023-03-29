interface Notifications16IconProps {
  className?: string
  title: string
}

export const Notifications16Icon = ({
  className = '',
  title,
}: Notifications16IconProps) => (
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
      d="M8 1a1 1 0 0 0-1 1 .125.125 0 0 1-.098.12A5.002 5.002 0 0 0 3 7v2.69a.75.75 0 0 1-.22.53l-.573.573a.707.707 0 0 0 .5 1.207H13.293a.707.707 0 0 0 .5-1.207l-.573-.573a.75.75 0 0 1-.22-.53V7a5.002 5.002 0 0 0-3.902-4.88A.125.125 0 0 1 9 2a1 1 0 0 0-1-1Zm2 12a2 2 0 1 1-4 0h4Z"
      fill="currentColor"
    />
  </svg>
)
