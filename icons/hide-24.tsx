import icon from './hide-24.svg?raw'

interface Hide24IconProps {
  className?: string
  title: string
}

export const Hide24Icon = ({ className = '', title }: Hide24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
