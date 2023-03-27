import icon from './access-24.svg?raw'

interface Access24IconProps {
  className?: string
  title: string
}

export const Access24Icon = ({ className = '', title }: Access24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
