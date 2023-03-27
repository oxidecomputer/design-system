import icon from './info-24.svg?raw'

interface Info24IconProps {
  className?: string
  title: string
}

export const Info24Icon = ({ className = '', title }: Info24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
