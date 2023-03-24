import icon from './load-balancer-16.svg?raw'

export const LoadBalancer16Icon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
