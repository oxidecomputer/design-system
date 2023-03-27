import icon from './load-balancer-24.svg?raw'

interface LoadBalancer24IconProps {
  className?: string
  title: string
}

export const LoadBalancer24Icon = ({ className = '', title }: LoadBalancer24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
