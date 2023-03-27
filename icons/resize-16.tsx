import icon from './resize-16.svg?raw'

interface Resize16IconProps {
  className?: string
  title: string
}

export const Resize16Icon = ({ className = '', title }: Resize16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
