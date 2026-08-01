import { useEffect, useRef } from 'react'

function RiverBackground() {
  const svgRef = useRef<SVGSVGElement>(null)
  const lineCount = 8

  useEffect(() => {
    let phase = 0
    let frameId: number

    const animate = () => {
      phase += 0.01
      const svg = svgRef.current
      if (svg) {
        const paths = svg.querySelectorAll('path')
        paths.forEach((path, i) => {
          const points: string[] = []
          const width = 1440
          const step = 20
          const baseY = (i + 1) * (3000 / (lineCount + 1))
          const amp = 25 - i * 1.5
          const speed = 1 + i * 0.15
          for (let x = 0; x <= width; x += step) {
            const y = baseY + Math.sin(x * 0.006 + phase * speed) * amp
            points.push(`${x},${y.toFixed(1)}`)
          }
          path.setAttribute('d', `M${points.join(' L')}`)
        })
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1440 3000"
      preserveAspectRatio="none"
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1, opacity: 0.15 }}
    >
      {Array.from({ length: lineCount }).map((_, i) => (
        <path key={i} fill="none" stroke="var(--rb-accent)" strokeWidth="2" />
      ))}
    </svg>
  )
}

export default RiverBackground