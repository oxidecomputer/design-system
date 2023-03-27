import icon from './health-16.svg?raw'

interface Health16IconProps {
  className?: string
  title: string
}

export const Health16Icon = ({ className = '', title }: Health16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
