import icon from './software-update-24.svg?raw'

export const SoftwareUpdate24Icon = ({ className = '' }: { className?: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
