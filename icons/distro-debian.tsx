import icon from './distro-debian.svg?raw'

interface DistroDebianIconProps {
  className?: string
  title: string
}

export const DistroDebianIcon = ({ className = '', title }: DistroDebianIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
