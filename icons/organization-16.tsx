import icon from './organization-16.svg?raw'

interface Organization16IconProps {
  className?: string
  title: string
}

export const Organization16Icon = ({ className = '', title }: Organization16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
