import icon from './issues-16.svg?raw'

interface Issues16IconProps {
  className?: string
  title: string
}

export const Issues16Icon = ({ className = '', title }: Issues16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
