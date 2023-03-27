import icon from './chat-24.svg?raw'

interface Chat24IconProps {
  className?: string
  title: string
}

export const Chat24Icon = ({ className = '', title }: Chat24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
