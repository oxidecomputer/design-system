import icon from './dots-24.svg?raw'

interface Dots24IconProps {
  className?: string
  title: string
}

export const Dots24Icon = ({ className = '', title }: Dots24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
