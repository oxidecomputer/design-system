import icon from './terminal-16.svg?raw'

interface Terminal16IconProps {
  className?: string
  title: string
}

export const Terminal16Icon = ({ className = '', title }: Terminal16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
