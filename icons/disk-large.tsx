import icon from './disk-large.svg?raw'

interface DiskLargeIconProps {
  className?: string
  title: string
}

export const DiskLargeIcon = ({ className = '', title }: DiskLargeIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
