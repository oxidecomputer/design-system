import icon from './disk-small.svg?raw'

interface DiskSmallIconProps {
  className?: string
  title: string
}

export const DiskSmallIcon = ({ className = '', title }: DiskSmallIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
