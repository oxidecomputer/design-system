import { React } from 'react'

import icon from './prev-arrow-12.svg?raw'

export const PrevArrow12Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
