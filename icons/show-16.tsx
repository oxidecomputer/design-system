import icon from './show-16.svg?raw'

interface Show16IconProps {
  className?: string
  title: string
}

export const Show16Icon = ({ className = '', title }: Show16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
