import icon from './prohibited-24.svg?raw'

interface Prohibited24IconProps {
  className?: string
  title: string
}

export const Prohibited24Icon = ({ className = '', title }: Prohibited24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
