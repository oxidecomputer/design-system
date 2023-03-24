import { React } from 'react'

import icon from './person-group-16.svg?raw'

export const PersonGroup16Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
