import icon from './distro-ubuntu.svg'

export const DistroUbuntu = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
