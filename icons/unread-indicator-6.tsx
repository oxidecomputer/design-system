import icon from './unread-indicator-6.svg?raw'

interface UnreadIndicator6IconProps {
  className?: string
  title: string
}

export const UnreadIndicator6Icon = ({
  className = '',
  title,
}: UnreadIndicator6IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
