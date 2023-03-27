import icon from './add-roundel-24.svg?raw'

interface AddRoundel24IconProps {
  className?: string
  title: string
}

export const AddRoundel24Icon = ({ className = '', title }: AddRoundel24IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
