import icon from './document-24.svg?raw'

interface Document24IconProps {
  className?: string
  title: string
}

export const Document24Icon = ({ className = '', title }: Document24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
