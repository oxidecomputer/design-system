import icon from './firewall-16.svg'

export const Firewall16 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
