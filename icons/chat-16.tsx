import icon from './chat-16.svg?raw'

interface Chat16IconProps {
  className?: string
  title: string
}

export const Chat16Icon = ({ className = '', title }: Chat16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
