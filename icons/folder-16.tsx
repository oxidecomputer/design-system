import icon from './folder-16.svg?raw'

interface Folder16IconProps {
  className?: string
  title: string
}

export const Folder16Icon = ({ className = '', title }: Folder16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
