import icon from './load-balancer-16.svg?raw'

interface LoadBalancer16IconProps {
  className?: string
  title: string
}

export const LoadBalancer16Icon = ({ className = '', title }: LoadBalancer16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
