import icon from './time-16.svg?raw'

interface Time16IconProps {
  className?: string
  title: string
}

export const Time16Icon = ({ className = '', title }: Time16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
