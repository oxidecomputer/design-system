import icon from './key-16.svg?raw'

interface Key16IconProps {
  className?: string
  title: string
}

export const Key16Icon = ({ className = '', title }: Key16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
