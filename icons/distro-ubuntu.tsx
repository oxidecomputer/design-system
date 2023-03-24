import icon from './distro-ubuntu.svg?raw'

export const DistroUbuntuIcon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
