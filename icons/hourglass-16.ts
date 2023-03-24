import { React } from 'react'

import icon from './hourglass-16.svg?raw'

export const Hourglass16Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
