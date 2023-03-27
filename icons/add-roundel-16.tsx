import icon from './add-roundel-16.svg?raw'

interface AddRoundel16IconProps {
  className?: string
  title: string
}

export const AddRoundel16Icon = ({ className = '', title }: AddRoundel16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
