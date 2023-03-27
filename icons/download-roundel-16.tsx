import icon from './download-roundel-16.svg?raw'

interface DownloadRoundel16IconProps {
  className?: string
  title: string
}

export const DownloadRoundel16Icon = ({
  className = '',
  title,
}: DownloadRoundel16IconProps) => (
  <span
    role="img"
    aria-label={title}
    className={`ox-icon ${className}`}
    dangerouslySetInnerHTML={{ __html: icon }}
  />
)
