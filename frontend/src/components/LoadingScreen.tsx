import { useEffect, useState } from 'react'

const WORD = 'RIVERBED'
const CHARS = '!<>-_\\/[]{}=+*^?#'

interface LoadingScreenProps {
  onComplete: () => void
}

function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [display, setDisplay] = useState('')
  const [glitchOffset, setGlitchOffset] = useState(0)

  useEffect(() => {
    let frame = 0
    const glitchInterval = setInterval(() => {
      frame++
      const revealCount = Math.min(Math.floor(frame / 3), WORD.length)
      let out = ''
      for (let i = 0; i < WORD.length; i++) {
        out += i < revealCount ? WORD[i] : CHARS[Math.floor(Math.random() * CHARS.length)]
      }
      setDisplay(out)
      setGlitchOffset(Math.random() * 6 - 3)
      if (revealCount >= WORD.length) {
        clearInterval(glitchInterval)
        setTimeout(onComplete, 500)
      }
    }, 90)

    return () => clearInterval(glitchInterval)
  }, [onComplete])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--rb-bg)' }}
    >
      <div className="relative" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div
          className="text-7xl font-medium tracking-widest absolute inset-0"
          style={{ color: 'var(--rb-accent)', opacity: 0.5, transform: `translateX(${glitchOffset}px)` }}
        >
          {display}
        </div>
        <div
          className="text-7xl font-medium tracking-widest absolute inset-0"
          style={{ color: '#eef2f8', opacity: 0.5, transform: `translateX(${-glitchOffset}px)` }}
        >
          {display}
        </div>
        <div
          className="text-7xl font-medium tracking-widest relative"
          style={{
            color: 'var(--rb-accent)',
            clipPath: `polygon(0 0, 100% 0, 100% 30%, 0 30%, 0 32%, 100% 32%, 100% 58%, 0 58%, 0 60%, 100% 60%, 100% 100%, 0 100%)`,
          }}
        >
          {display}
        </div>
      </div>

    </div>
  )
}

export default LoadingScreen