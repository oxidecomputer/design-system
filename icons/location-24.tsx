import icon from './location-24.svg?raw'

interface Location24IconProps {
  className?: string
  title: string
}

export const Location24Icon = ({ className = '', title }: Location24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
