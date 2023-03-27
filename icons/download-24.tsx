import icon from './download-24.svg?raw'

interface Download24IconProps {
  className?: string
  title: string
}

export const Download24Icon = ({ className = '', title }: Download24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
