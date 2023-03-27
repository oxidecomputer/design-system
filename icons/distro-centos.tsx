import icon from './distro-centos.svg?raw'

interface DistroCentosIconProps {
  className?: string
  title: string
}

export const DistroCentosIcon = ({ className = '', title }: DistroCentosIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
