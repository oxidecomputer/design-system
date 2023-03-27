import icon from './help-16.svg?raw'

interface Help16IconProps {
  className?: string
  title: string
}

export const Help16Icon = ({ className = '', title }: Help16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
