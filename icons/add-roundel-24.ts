import { React } from 'react'

import icon from './add-roundel-24.svg?raw'

export const AddRoundel24Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
