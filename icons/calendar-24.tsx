import icon from './calendar-24.svg?raw'

interface Calendar24IconProps {
  className?: string
  title: string
}

export const Calendar24Icon = ({ className = '', title }: Calendar24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
