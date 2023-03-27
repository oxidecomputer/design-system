import icon from './distro-alpine.svg?raw'

interface DistroAlpineIconProps {
  className?: string
  title: string
}

export const DistroAlpineIcon = ({ className = '', title }: DistroAlpineIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
