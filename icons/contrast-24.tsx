import icon from './contrast-24.svg?raw'

export const Contrast24Icon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
