const titleCase = (text: string): string => {
  return text.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  )
}

export { titleCase }
