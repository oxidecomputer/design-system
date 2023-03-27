import icon from './instances-16.svg?raw'

interface Instances16IconProps {
  className?: string
  title: string
}

export const Instances16Icon = ({ className = '', title }: Instances16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
