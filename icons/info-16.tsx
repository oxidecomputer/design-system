import icon from './info-16.svg?raw'

interface Info16IconProps {
  className?: string
  title: string
}

export const Info16Icon = ({ className = '', title }: Info16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
