import icon from './distro-arch.svg?raw'

interface DistroArchIconProps {
  className?: string
  title: string
}

export const DistroArchIcon = ({ className = '', title }: DistroArchIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
