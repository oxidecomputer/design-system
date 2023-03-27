import icon from './folder-24.svg?raw'

interface Folder24IconProps {
  className?: string
  title: string
}

export const Folder24Icon = ({ className = '', title }: Folder24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
