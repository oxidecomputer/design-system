import icon from './ip-global-16.svg?raw'

interface IpGlobal16IconProps {
  className?: string
  title: string
}

export const IpGlobal16Icon = ({ className = '', title }: IpGlobal16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
