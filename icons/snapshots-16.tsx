import icon from './snapshots-16.svg?raw'

interface Snapshots16IconProps {
  className?: string
  title: string
}

export const Snapshots16Icon = ({ className = '', title }: Snapshots16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
