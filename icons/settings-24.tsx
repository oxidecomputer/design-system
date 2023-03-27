import icon from './settings-24.svg?raw'

interface Settings24IconProps {
  className?: string
  title: string
}

export const Settings24Icon = ({ className = '', title }: Settings24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
