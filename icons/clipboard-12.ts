import { React } from 'react'

import icon from './clipboard-12.svg?raw'

export const Clipboard12Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
