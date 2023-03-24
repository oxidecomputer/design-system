import { React } from 'react'

import icon from './cpu-small.svg?raw'

export const CpuSmallIcon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
