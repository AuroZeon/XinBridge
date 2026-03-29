/**
 * Image with gradient fallback when load fails (e.g. CDN blocked on iPad/Safari)
 */
import { useState, type ReactNode } from 'react'

interface ImgWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string
  fallback?: ReactNode
}

export function ImgWithFallback({ src, alt, className, fallbackClassName, fallback, ...rest }: ImgWithFallbackProps) {
  const [errored, setErrored] = useState(false)
  if (errored || !src) {
    return (
      <div
        className={`flex items-center justify-center ${fallbackClassName ?? className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(5,150,105,0.2) 50%, rgba(13,148,136,0.15) 100%)',
          minHeight: 48,
          minWidth: 48,
        }}
        aria-hidden
      >
        {fallback}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      onError={() => setErrored(true)}
      decoding="async"
      loading="eager"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      {...rest}
    />
  )
}
