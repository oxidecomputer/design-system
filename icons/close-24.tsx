import icon from './close-24.svg?raw'

interface Close24IconProps {
  className?: string
  title: string
}

export const Close24Icon = ({ className = '', title }: Close24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
