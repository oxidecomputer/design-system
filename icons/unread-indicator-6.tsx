import icon from './unread-indicator-6.svg?raw'

export const UnreadIndicator6Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
