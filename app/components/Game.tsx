'use client'

import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'

export default function Game() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const pogoRef = useRef<any>(null)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const Engine = Matter.Engine
    const Render = Matter.Render
    const World = Matter.World
    const Bodies = Matter.Bodies
    const Body = Matter.Body
    const Constraint = Matter.Constraint
    const Events = Matter.Events
    const Runner = Matter.Runner

    const engine = Engine.create({
      gravity: { x: 0, y: 1.5 }
    })
    engineRef.current = engine

    const render = Render.create({
      element: canvasRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#87CEEB'
      }
    })

    // Create ground and platforms
    const ground = Bodies.rectangle(400, window.innerHeight - 25, 10000, 50, {
      isStatic: true,
      render: { fillStyle: '#654321' }
    })

    const platform1 = Bodies.rectangle(600, window.innerHeight - 150, 200, 20, {
      isStatic: true,
      render: { fillStyle: '#8B4513' }
    })

    const platform2 = Bodies.rectangle(900, window.innerHeight - 250, 200, 20, {
      isStatic: true,
      render: { fillStyle: '#8B4513' }
    })

    const platform3 = Bodies.rectangle(1200, window.innerHeight - 350, 200, 20, {
      isStatic: true,
      render: { fillStyle: '#8B4513' }
    })

    // Spikes
    const spikes: Matter.Body[] = []
    for (let i = 0; i < 5; i++) {
      const spike = Bodies.rectangle(
        750 + i * 30,
        window.innerHeight - 50,
        20,
        40,
        {
          isStatic: true,
          render: { fillStyle: '#FF0000' },
          label: 'spike'
        }
      )
      spikes.push(spike)
    }

    // Win flag
    const flagPole = Bodies.rectangle(1300, window.innerHeight - 450, 10, 200, {
      isStatic: true,
      render: { fillStyle: '#654321' }
    })

    const flag = Bodies.rectangle(1340, window.innerHeight - 530, 80, 60, {
      isStatic: true,
      render: { fillStyle: '#00FF00' },
      label: 'goal'
    })

    // Create Pogo Stickman
    const headRadius = 20
    const bodyHeight = 60
    const legLength = 50
    const armLength = 40

    const startX = 150
    const startY = window.innerHeight - 200

    // Head
    const head = Bodies.circle(startX, startY - bodyHeight - headRadius, headRadius, {
      density: 0.001,
      friction: 0.1,
      render: { fillStyle: '#FFD700' },
      label: 'head'
    })

    // Body
    const body = Bodies.rectangle(startX, startY - bodyHeight / 2, 15, bodyHeight, {
      density: 0.001,
      friction: 0.1,
      render: { fillStyle: '#FFD700' }
    })

    // Arms
    const leftArm = Bodies.rectangle(startX - 20, startY - bodyHeight / 2, 10, armLength, {
      density: 0.0005,
      friction: 0.1,
      render: { fillStyle: '#FFD700' }
    })

    const rightArm = Bodies.rectangle(startX + 20, startY - bodyHeight / 2, 10, armLength, {
      density: 0.0005,
      friction: 0.1,
      render: { fillStyle: '#FFD700' }
    })

    // Legs
    const leftLeg = Bodies.rectangle(startX - 10, startY + legLength / 2, 10, legLength, {
      density: 0.0005,
      friction: 0.1,
      render: { fillStyle: '#FFD700' }
    })

    const rightLeg = Bodies.rectangle(startX + 10, startY + legLength / 2, 10, legLength, {
      density: 0.0005,
      friction: 0.1,
      render: { fillStyle: '#FFD700' }
    })

    // Pogo stick
    const pogoStick = Bodies.rectangle(startX, startY + legLength + 30, 8, 80, {
      density: 0.002,
      friction: 0.8,
      restitution: 0.9,
      render: { fillStyle: '#C0C0C0' }
    })

    const pogoSpring = Bodies.circle(startX, startY + legLength + 75, 15, {
      density: 0.003,
      friction: 0.9,
      restitution: 1.2,
      render: { fillStyle: '#FF0000' },
      label: 'pogoSpring'
    })

    // Constraints to connect body parts
    const headToBody = Constraint.create({
      bodyA: head,
      bodyB: body,
      length: headRadius + 5,
      stiffness: 0.5
    })

    const bodyToLeftArm = Constraint.create({
      bodyA: body,
      bodyB: leftArm,
      pointA: { x: -7, y: -20 },
      pointB: { x: 0, y: -armLength / 2 },
      length: 5,
      stiffness: 0.3
    })

    const bodyToRightArm = Constraint.create({
      bodyA: body,
      bodyB: rightArm,
      pointA: { x: 7, y: -20 },
      pointB: { x: 0, y: -armLength / 2 },
      length: 5,
      stiffness: 0.3
    })

    const bodyToLeftLeg = Constraint.create({
      bodyA: body,
      bodyB: leftLeg,
      pointA: { x: -5, y: bodyHeight / 2 },
      pointB: { x: 0, y: -legLength / 2 },
      length: 5,
      stiffness: 0.4
    })

    const bodyToRightLeg = Constraint.create({
      bodyA: body,
      bodyB: rightLeg,
      pointA: { x: 5, y: bodyHeight / 2 },
      pointB: { x: 0, y: -legLength / 2 },
      length: 5,
      stiffness: 0.4
    })

    const leftLegToPogo = Constraint.create({
      bodyA: leftLeg,
      bodyB: pogoStick,
      pointA: { x: 0, y: legLength / 2 },
      pointB: { x: 0, y: -35 },
      length: 5,
      stiffness: 0.5
    })

    const rightLegToPogo = Constraint.create({
      bodyA: rightLeg,
      bodyB: pogoStick,
      pointA: { x: 0, y: legLength / 2 },
      pointB: { x: 0, y: -35 },
      length: 5,
      stiffness: 0.5
    })

    const pogoToSpring = Constraint.create({
      bodyA: pogoStick,
      bodyB: pogoSpring,
      pointA: { x: 0, y: 40 },
      length: 0,
      stiffness: 0.8
    })

    const pogo = {
      head,
      body,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      pogoStick,
      pogoSpring,
      parts: [head, body, leftArm, rightArm, leftLeg, rightLeg, pogoStick, pogoSpring],
      constraints: [
        headToBody,
        bodyToLeftArm,
        bodyToRightArm,
        bodyToLeftLeg,
        bodyToRightLeg,
        leftLegToPogo,
        rightLegToPogo,
        pogoToSpring
      ]
    }

    pogoRef.current = pogo

    World.add(engine.world, [
      ground,
      platform1,
      platform2,
      platform3,
      ...spikes,
      flagPole,
      flag,
      ...pogo.parts,
      ...pogo.constraints
    ])

    // Controls
    const keys: { [key: string]: boolean } = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true
      if (!started) setStarted(true)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Game loop
    Events.on(engine, 'beforeUpdate', () => {
      if (gameOver || won) return

      const moveForce = 0.003
      const jumpForce = 0.015

      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        pogo.parts.forEach(part => {
          Body.applyForce(part, part.position, { x: -moveForce, y: 0 })
        })
      }

      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        pogo.parts.forEach(part => {
          Body.applyForce(part, part.position, { x: moveForce, y: 0 })
        })
      }

      if (keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) {
        Body.applyForce(pogoSpring, pogoSpring.position, { x: 0, y: -jumpForce })
      }

      // Lean forward/backward
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        Body.setAngularVelocity(body, -0.05)
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        Body.setAngularVelocity(body, 0.05)
      }
    })

    // Collision detection
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair

        // Check spike collision
        if (
          (bodyA.label === 'spike' || bodyB.label === 'spike') &&
          (pogo.parts.includes(bodyA) || pogo.parts.includes(bodyB))
        ) {
          if ((bodyA.label === 'head' || bodyB.label === 'head') && !gameOver) {
            setGameOver(true)
          }
        }

        // Check goal collision
        if (
          (bodyA.label === 'goal' || bodyB.label === 'goal') &&
          (bodyA.label === 'head' || bodyB.label === 'head')
        ) {
          setWon(true)
        }
      })
    })

    // Camera follow
    Events.on(render, 'afterRender', () => {
      const centerX = body.position.x
      const translateX = window.innerWidth / 2 - centerX

      render.bounds.min.x = centerX - window.innerWidth / 2
      render.bounds.max.x = centerX + window.innerWidth / 2
      render.bounds.min.y = 0
      render.bounds.max.y = window.innerHeight

      render.context.setTransform(1, 0, 0, 1, 0, 0)
    })

    const runner = Runner.create()
    Runner.run(runner, engine)
    Render.run(render)

    return () => {
      Render.stop(render)
      Runner.stop(runner)
      World.clear(engine.world, false)
      Engine.clear(engine)
      render.canvas.remove()
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const restartGame = () => {
    setGameOver(false)
    setWon(false)
    setStarted(false)
    window.location.reload()
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={canvasRef} />

      {!started && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 10px 0' }}>Happy Wheels Clone - Pogo Stickman</h1>
          <p>Arrow Keys or WASD to Move</p>
          <p>Space or Up Arrow to Jump</p>
          <p>Avoid spikes and reach the green flag!</p>
        </div>
      )}

      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 20px 0', fontSize: '48px' }}>GAME OVER!</h1>
          <p style={{ marginBottom: '20px', fontSize: '20px' }}>You hit the spikes!</p>
          <button
            onClick={restartGame}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Restart
          </button>
        </div>
      )}

      {won && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 255, 0, 0.9)',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{ margin: '0 0 20px 0', fontSize: '48px' }}>YOU WIN!</h1>
          <p style={{ marginBottom: '20px', fontSize: '20px' }}>You reached the flag!</p>
          <button
            onClick={restartGame}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
