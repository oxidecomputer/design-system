import icon from './new-window-16.svg?raw'

interface NewWindow16IconProps {
  className?: string
  title: string
}

export const NewWindow16Icon = ({ className = '', title }: NewWindow16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
