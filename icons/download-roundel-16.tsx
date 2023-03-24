import icon from './download-roundel-16.svg?raw'

export const DownloadRoundel16Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
