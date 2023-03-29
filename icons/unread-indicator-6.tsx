interface UnreadIndicator6IconProps {
  className?: string
  title: string
}

export const UnreadIndicator6Icon = ({
  className = '',
  title,
}: UnreadIndicator6IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="6"
    height="6"
    viewBox="0 0 6 6"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="3" cy="3" r="3" fill="currentColor" />
  </svg>
)
