import icon from './cpu-small.svg?raw'

interface CpuSmallIconProps {
  className?: string
  title: string
}

export const CpuSmallIcon = ({ className = '', title }: CpuSmallIconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
