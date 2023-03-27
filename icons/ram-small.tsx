import icon from './ram-small.svg?raw'

interface RamSmallIconProps {
  className?: string
  title: string
}

export const RamSmallIcon = ({ className = '', title }: RamSmallIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
