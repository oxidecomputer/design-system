import icon from './ip-local-16.svg?raw'

interface IpLocal16IconProps {
  className?: string
  title: string
}

export const IpLocal16Icon = ({ className = '', title }: IpLocal16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
