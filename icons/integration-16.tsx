import icon from './integration-16.svg?raw'

interface Integration16IconProps {
  className?: string
  title: string
}

export const Integration16Icon = ({ className = '', title }: Integration16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
