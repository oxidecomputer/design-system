import icon from './key-24.svg?raw'

interface Key24IconProps {
  className?: string
  title: string
}

export const Key24Icon = ({ className = '', title }: Key24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
