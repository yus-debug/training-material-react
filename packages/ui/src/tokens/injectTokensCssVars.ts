export function injectTokensCssVars(): void {
  if (typeof document === 'undefined') return
  const id = 'sample-tokens-css'
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = '/tokens.css'
  document.head.appendChild(link)
}


