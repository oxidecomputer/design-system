import icon from './close-8.svg?raw'

interface Close8IconProps {
  className?: string
  title: string
}

export const Close8Icon = ({ className = '', title }: Close8IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
