import icon from './distro-freebsd.svg'

export const DistroFreebsd = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
