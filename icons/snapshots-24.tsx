import icon from './snapshots-24.svg?raw'

interface Snapshots24IconProps {
  className?: string
  title: string
}

export const Snapshots24Icon = ({ className = '', title }: Snapshots24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
