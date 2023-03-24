import icon from './settings-24.svg?raw'

export const Settings24Icon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
