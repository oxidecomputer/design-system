import icon from './email-16.svg?raw'

interface Email16IconProps {
  className?: string
  title: string
}

export const Email16Icon = ({ className = '', title }: Email16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
