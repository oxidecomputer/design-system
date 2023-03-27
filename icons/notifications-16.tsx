import icon from './notifications-16.svg?raw'

interface Notifications16IconProps {
  className?: string
  title: string
}

export const Notifications16Icon = ({
  className = '',
  title,
}: Notifications16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
