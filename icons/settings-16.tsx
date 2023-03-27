import icon from './settings-16.svg?raw'

interface Settings16IconProps {
  className?: string
  title: string
}

export const Settings16Icon = ({ className = '', title }: Settings16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
