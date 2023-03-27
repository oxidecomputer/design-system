import icon from './document-16.svg?raw'

interface Document16IconProps {
  className?: string
  title: string
}

export const Document16Icon = ({ className = '', title }: Document16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
