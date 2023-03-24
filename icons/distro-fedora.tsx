import icon from './distro-fedora.svg?raw'

export const DistroFedoraIcon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
