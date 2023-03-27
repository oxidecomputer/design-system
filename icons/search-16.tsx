import icon from './search-16.svg?raw'

interface Search16IconProps {
  className?: string
  title: string
}

export const Search16Icon = ({ className = '', title }: Search16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
