import icon from './transmit-24.svg?raw'

interface Transmit24IconProps {
  className?: string
  title: string
}

export const Transmit24Icon = ({ className = '', title }: Transmit24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
