import icon from './unread-indicator-6.svg'

export const UnreadIndicator6 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
