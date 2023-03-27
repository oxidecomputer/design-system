import icon from './cpu-large.svg?raw'

interface CpuLargeIconProps {
  className?: string
  title: string
}

export const CpuLargeIcon = ({ className = '', title }: CpuLargeIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
