import icon from './ip-global-24.svg?raw'

export const IpGlobal24Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
