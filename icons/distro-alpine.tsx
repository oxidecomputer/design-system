import icon from './distro-alpine.svg?raw'

export const DistroAlpineIcon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
