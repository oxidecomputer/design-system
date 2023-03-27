import icon from './clipboard-16.svg?raw'

interface Clipboard16IconProps {
  className?: string
  title: string
}

export const Clipboard16Icon = ({ className = '', title }: Clipboard16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
