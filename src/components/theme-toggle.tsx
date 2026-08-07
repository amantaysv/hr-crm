'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Theme = 'light' | 'dark'

/**
 * The inline script in layout.tsx always writes data-theme before paint, so the
 * attribute is the single source of truth. Subscribing to it beats mirroring it
 * into state: no effect, no cascading render, and the icon stays correct even if
 * something else flips the attribute.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light'
}

export function ThemeToggle() {
  // null on the server and until hydration — the button renders disabled.
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => null)

  if (!theme) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Переключить тему"
        disabled
      >
        <Sun className="size-4" />
      </Button>
    )
  }

  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        next === 'dark' ? 'Включить тёмную тему' : 'Включить светлую тему'
      }
      onClick={() => {
        document.documentElement.setAttribute('data-theme', next)
        try {
          localStorage.setItem('theme', next)
        } catch {
          // Private mode / blocked storage: the theme still applies for this page.
        }
      }}
    >
      {theme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )
}
