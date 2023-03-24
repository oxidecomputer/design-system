import icon from './show-16.svg?raw'

export const Show16Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
