import icon from './issues-24.svg?raw'

interface Issues24IconProps {
  className?: string
  title: string
}

export const Issues24Icon = ({ className = '', title }: Issues24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
