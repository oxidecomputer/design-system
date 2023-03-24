import { React } from 'react'

import icon from './prohibited-24.svg?raw'

export const Prohibited24Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
