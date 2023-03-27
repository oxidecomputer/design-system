import icon from './distro-fedora.svg?raw'

interface DistroFedoraIconProps {
  className?: string
  title: string
}

export const DistroFedoraIcon = ({ className = '', title }: DistroFedoraIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
