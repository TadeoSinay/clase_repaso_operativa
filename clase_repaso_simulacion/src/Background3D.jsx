import { useEffect, useRef } from 'react'
import styles from './App.module.css'

const N = 80
const CONNECT = 130
const FOV = 600

function mkParticles() {
  return Array.from({ length: N }, () => ({
    x:  (Math.random() - 0.5) * 1400,
    y:  (Math.random() - 0.5) * 900,
    z:  Math.random() * 900,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.35,
    vz: (Math.random() - 0.5) * 0.3,
  }))
}

export default function Background3D() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const pts = mkParticles()
    let angle = 0
    let raf

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const project = (x, y, z) => {
      const s = FOV / (FOV + z)
      return { sx: x * s + canvas.width / 2, sy: y * s + canvas.height / 2, s }
    }

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      angle += 0.0015
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      // Update positions
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.z += p.vz
        if (Math.abs(p.x) > 800) p.vx *= -1
        if (Math.abs(p.y) > 550) p.vy *= -1
        if (p.z < 0 || p.z > 900) p.vz *= -1
      }

      // Rotate & project
      const proj = pts.map(p => {
        const rx = p.x * cos - p.z * sin
        const rz = p.x * sin + p.z * cos
        return project(rx, p.y, rz)
      })

      // Lines between nearby particles
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = proj[i].sx - proj[j].sx
          const dy = proj[i].sy - proj[j].sy
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECT) {
            const a = (1 - d / CONNECT) * 0.28
            ctx.strokeStyle = `rgba(168,85,247,${a})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(proj[i].sx, proj[i].sy)
            ctx.lineTo(proj[j].sx, proj[j].sy)
            ctx.stroke()
          }
        }
      }

      // Dots
      for (const { sx, sy, s } of proj) {
        const r = Math.max(0.8, s * 3.2)
        ctx.fillStyle = `rgba(168,85,247,${s * 0.75})`
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    frame()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className={styles.bg3d} />
}
