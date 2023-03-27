import icon from './ip-local-24.svg?raw'

interface IpLocal24IconProps {
  className?: string
  title: string
}

export const IpLocal24Icon = ({ className = '', title }: IpLocal24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
