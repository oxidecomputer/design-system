import icon from './terminal-24.svg?raw'

interface Terminal24IconProps {
  className?: string
  title: string
}

export const Terminal24Icon = ({ className = '', title }: Terminal24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
