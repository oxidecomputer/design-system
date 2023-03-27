import icon from './dots-16.svg?raw'

interface Dots16IconProps {
  className?: string
  title: string
}

export const Dots16Icon = ({ className = '', title }: Dots16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
