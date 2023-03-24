import icon from './distro-freebsd.svg?raw'

export const DistroFreebsdIcon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
