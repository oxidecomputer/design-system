import icon from './select-arrows-6.svg?raw'

export const SelectArrows6Icon = ({ className = '' }: { className: string }) => (
  <span className={`ox-icon ${className}`} dangerouslySetInnerHTML={{ __html: icon }} />
)
