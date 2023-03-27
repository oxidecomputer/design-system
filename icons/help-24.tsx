import icon from './help-24.svg?raw'

interface Help24IconProps {
  className?: string
  title: string
}

export const Help24Icon = ({ className = '', title }: Help24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
