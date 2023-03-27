import icon from './edit-16.svg?raw'

interface Edit16IconProps {
  className?: string
  title: string
}

export const Edit16Icon = ({ className = '', title }: Edit16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
