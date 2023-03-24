import icon from './ram-small.svg?raw'

export const RamSmallIcon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
