import icon from './instances-24.svg?raw'

interface Instances24IconProps {
  className?: string
  title: string
}

export const Instances24Icon = ({ className = '', title }: Instances24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
