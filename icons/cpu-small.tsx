import icon from './cpu-small.svg?raw'

export const CpuSmallIcon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
