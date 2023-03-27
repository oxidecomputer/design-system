import icon from './profile-16.svg?raw'

interface Profile16IconProps {
  className?: string
  title: string
}

export const Profile16Icon = ({ className = '', title }: Profile16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
