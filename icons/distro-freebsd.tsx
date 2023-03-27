import icon from './distro-freebsd.svg?raw'

interface DistroFreebsdIconProps {
  className?: string
  title: string
}

export const DistroFreebsdIcon = ({ className = '', title }: DistroFreebsdIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
