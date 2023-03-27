import icon from './wireless-24.svg?raw'

interface Wireless24IconProps {
  className?: string
  title: string
}

export const Wireless24Icon = ({ className = '', title }: Wireless24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
