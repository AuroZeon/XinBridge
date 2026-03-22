/**
 * Image with gradient fallback when load fails (e.g. CDN blocked)
 */
import { useState } from 'react'

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
}

export function ImgWithFallback({ src, alt, className, fallbackClassName, ...rest }: ImgWithFallbackProps) {
  const [errored, setErrored] = useState(false)
  if (errored || !src) {
    return (
      <div
        className={fallbackClassName ?? className}
        style={{
          background: 'linear-gradient(135deg, rgba(15,118,110,0.2) 0%, rgba(13,148,136,0.15) 100%)',
        }}
        aria-hidden
      />
    )
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      onError={() => setErrored(true)}
      decoding="async"
      {...rest}
    />
  )
}
