import icon from './overview-16.svg?raw'

interface Overview16IconProps {
  className?: string
  title: string
}

export const Overview16Icon = ({ className = '', title }: Overview16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
