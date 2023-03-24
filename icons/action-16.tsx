import icon from './action-16.svg?raw'

export const Action16Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
