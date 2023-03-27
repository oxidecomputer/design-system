import icon from './hourglass-24.svg?raw'

interface Hourglass24IconProps {
  className?: string
  title: string
}

export const Hourglass24Icon = ({ className = '', title }: Hourglass24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
