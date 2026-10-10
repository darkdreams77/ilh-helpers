"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const COLORS = ["#ffc15e", "#ff9f1c", "#f5ff90", "#d6ffb7", "#7c6cf0"]

type Piece = {
  id: number
  left: number
  color: string
  size: number
  dx: number
  dy: number
  rot: number
  delay: number
}

/** Pluie de confettis déclenchée par `fire()`. Désactivée si l'utilisateur réduit les animations. */
export function useConfetti() {
  const [pieces, setPieces] = useState<Piece[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const counter = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const fire = useCallback(() => {
    const batch = counter.current++
    setPieces(
      Array.from({ length: 48 }, (_, i) => ({
        id: batch * 100 + i,
        left: 35 + Math.random() * 30,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
        dx: (Math.random() - 0.5) * 520,
        dy: 280 + Math.random() * 360,
        rot: (Math.random() - 0.5) * 900,
        delay: Math.random() * 120,
      })),
    )
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPieces([]), 1800)
  }, [])

  const node = (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece absolute top-1/4 block rounded-[2px]"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
              "--dx": `${piece.dx}px`,
              "--dy": `${piece.dy}px`,
              "--rot": `${piece.rot}deg`,
              animation: `confetti-fall 1.6s ${piece.delay}ms cubic-bezier(0.2, 0.7, 0.4, 1) forwards`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )

  return { fire, node }
}
