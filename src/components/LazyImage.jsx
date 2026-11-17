import { useEffect, useState } from 'react'

// 图片懒加载 Hook：传入 loader (动态 import 函数)，返回已加载的 URL
export function useLazyImage(loader) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!loader) return
    let cancelled = false

    loader().then((src) => {
      if (!cancelled) setUrl(src)
    })

    return () => {
      cancelled = true
    }
  }, [loader])

  return url
}

// 懒加载 <img> 包装器：自动调用 loader 并渲染
export function LazyImage({ loader, alt, className, ...props }) {
  const url = useLazyImage(loader)

  if (!url) {
    return (
      <div className={`animate-pulse bg-gray-200 ${className || ''}`} {...props}>
        <span className="sr-only">加载中...</span>
      </div>
    )
  }

  return <img src={url} alt={alt} loading="lazy" className={className} {...props} />
}
