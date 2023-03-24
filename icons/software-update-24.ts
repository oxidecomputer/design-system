import { React } from 'react'

import icon from './software-update-24.svg?raw'

export const SoftwareUpdate24Icon = ({ className = '' }: { className?: string }) =>
  /*#__PURE__*/ React.createElement('span', {
    className: `ox-icon ${className}`,
    dangerouslySetInnerHTML: { __html: icon },
  })
