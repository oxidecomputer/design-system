import icon from './overview-24.svg?raw'

interface Overview24IconProps {
  className?: string
  title: string
}

export const Overview24Icon = ({ className = '', title }: Overview24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
