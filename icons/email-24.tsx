import icon from './email-24.svg?raw'

interface Email24IconProps {
  className?: string
  title: string
}

export const Email24Icon = ({ className = '', title }: Email24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
