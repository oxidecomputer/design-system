import icon from './software-update-16.svg?raw'

export const SoftwareUpdate16Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
