import icon from './profile-16.svg?raw'

export const Profile16Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)