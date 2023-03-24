import { React } from 'react'

import icon from './disk-large.svg?raw'

export const DiskLargeIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
