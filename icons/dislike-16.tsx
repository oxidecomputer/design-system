import icon from './dislike-16.svg?raw'

interface Dislike16IconProps {
  className?: string
  title: string
}

export const Dislike16Icon = ({ className = '', title }: Dislike16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
