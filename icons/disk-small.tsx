import icon from './disk-small.svg?raw'

export const DiskSmallIcon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
