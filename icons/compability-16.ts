import { React } from 'react'

import icon from './compability-16.svg?raw'

export const Compability16Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
