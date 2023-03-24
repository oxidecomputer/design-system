import icon from './download-roundel-16.svg'

export const DownloadRoundel16 = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
