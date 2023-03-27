import icon from './access-16.svg?raw'

interface Access16IconProps {
  className?: string
  title: string
}

export const Access16Icon = ({ className = '', title }: Access16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
