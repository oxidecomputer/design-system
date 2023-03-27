import icon from './hide-16.svg?raw'

interface Hide16IconProps {
  className?: string
  title: string
}

export const Hide16Icon = ({ className = '', title }: Hide16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
