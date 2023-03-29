interface Router16IconProps {
  className?: string
  title: string
}

export const Router16Icon = ({ className = '', title }: Router16IconProps) => (
  <svg
    className={`ox-icon ${className}`}
    aria-label={title}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13.268 3.414a.75.75 0 0 1 0 1.172L9.609 7.513A.375.375 0 0 1 9 7.22V6H3.75A.75.75 0 0 1 3 5.25v-2.5A.75.75 0 0 1 3.75 2H9V.78c0-.314.364-.489.61-.293l3.658 2.927Zm-10.536 8a.75.75 0 0 0 0 1.172l3.659 2.927c.245.196.609.021.609-.293V14h5.25a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75H7V8.78a.375.375 0 0 0-.61-.293l-3.658 2.927Z"
      fill="currentColor"
    />
  </svg>
)
