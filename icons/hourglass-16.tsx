import icon from './hourglass-16.svg?raw'

interface Hourglass16IconProps {
  className?: string
  title: string
}

export const Hourglass16Icon = ({ className = '', title }: Hourglass16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
