import { React } from 'react'

import icon from './unauthorized-12.svg?raw'

export const Unauthorized12Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
