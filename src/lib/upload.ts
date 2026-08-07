/**
 * Uploads a file to Supabase Storage over XHR so the caller can render real
 * progress. The supabase-js `.upload()` helper wraps fetch and exposes no
 * progress events, and the design calls for a percentage during the upload.
 */
export function uploadWithProgress({
  bucket,
  path,
  file,
  onProgress,
  signal,
}: {
  bucket: string
  path: string
  file: File
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}): Promise<{ ok: true } | { ok: false; reason: 'aborted' | 'failed' }> {
  return new Promise((resolve) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      resolve({ ok: false, reason: 'failed' })
      return
    }

    const xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `${url}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`,
    )
    xhr.setRequestHeader('apikey', key)
    xhr.setRequestHeader('authorization', `Bearer ${key}`)
    xhr.setRequestHeader('x-upsert', 'false')
    if (file.type) xhr.setRequestHeader('content-type', file.type)

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) return
      onProgress?.(Math.round((event.loaded / event.total) * 100))
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve({ ok: true })
      } else {
        resolve({ ok: false, reason: 'failed' })
      }
    })
    xhr.addEventListener('error', () =>
      resolve({ ok: false, reason: 'failed' }),
    )
    xhr.addEventListener('abort', () =>
      resolve({ ok: false, reason: 'aborted' }),
    )

    signal?.addEventListener('abort', () => xhr.abort(), { once: true })

    xhr.send(file)
  })
}

export const RESUME_MAX_BYTES = 10 * 1024 * 1024
export const RESUME_ACCEPT = '.pdf,.doc,.docx'

const RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']

export function validateResume(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!RESUME_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return 'Резюме принимаем в формате PDF, DOC или DOCX'
  }
  if (file.size > RESUME_MAX_BYTES) {
    return 'Файл больше 10 МБ — приложите версию поменьше'
  }
  if (file.size === 0) {
    return 'Файл пустой'
  }
  return null
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}
