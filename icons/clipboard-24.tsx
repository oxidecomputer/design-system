import icon from './clipboard-24.svg?raw'

interface Clipboard24IconProps {
  className?: string
  title: string
}

export const Clipboard24Icon = ({ className = '', title }: Clipboard24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
