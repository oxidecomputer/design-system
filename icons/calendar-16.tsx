import icon from './calendar-16.svg?raw'

interface Calendar16IconProps {
  className?: string
  title: string
}

export const Calendar16Icon = ({ className = '', title }: Calendar16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
