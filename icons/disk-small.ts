import { React } from 'react'

import icon from './disk-small.svg?raw'

export const DiskSmallIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
