import icon from './distro-ubuntu.svg?raw'

interface DistroUbuntuIconProps {
  className?: string
  title: string
}

export const DistroUbuntuIcon = ({ className = '', title }: DistroUbuntuIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
