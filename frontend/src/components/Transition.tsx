import { useEffect, useState } from 'react'

interface TransitionProps {
  onComplete: () => void
}

function Transition({ onComplete }: TransitionProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 300)
          return 100
        }
        return p + 1.5
      })
    }, 30)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--rb-bg)' }}>
      <div className="w-56 h-1 rounded-full overflow-hidden" style={{ background: 'var(--rb-surface)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, background: 'var(--rb-accent)', transition: 'width 0.02s linear' }}
        />
      </div>
    </div>
  )
}

export default Transition