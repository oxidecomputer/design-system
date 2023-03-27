import icon from './close-16.svg?raw'

interface Close16IconProps {
  className?: string
  title: string
}

export const Close16Icon = ({ className = '', title }: Close16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
