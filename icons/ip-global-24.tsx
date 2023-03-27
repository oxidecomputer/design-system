import icon from './ip-global-24.svg?raw'

interface IpGlobal24IconProps {
  className?: string
  title: string
}

export const IpGlobal24Icon = ({ className = '', title }: IpGlobal24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
