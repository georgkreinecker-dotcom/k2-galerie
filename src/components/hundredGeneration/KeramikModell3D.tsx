import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { HundredGenerationModellId } from '../config/hundredGenerationEntwuerfe'

const CLAY = 0xb08968
const CLAY_DARK = 0x7a5a3a
const CLAY_LIGHT = 0xd4b896

function clayMat(color = CLAY, rough = 0.92): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: 0.05,
    flatShading: rough > 0.85,
  })
}

function displaceIcosahedron(mesh: THREE.Mesh, amount: number) {
  const geo = mesh.geometry as THREE.BufferGeometry
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const n =
      Math.sin(x * 3.1 + y * 2.4) * Math.cos(z * 2.7 + x) * amount +
      Math.sin((x + z) * 5.2) * amount * 0.45
    const len = Math.sqrt(x * x + y * y + z * z) || 1
    const f = 1 + n / len
    pos.setXYZ(i, x * f, y * f, z * f)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

function buildModell(id: HundredGenerationModellId): THREE.Object3D {
  const root = new THREE.Group()

  if (id === 'chaosgott') {
    const geo = new THREE.IcosahedronGeometry(1.15, 3)
    const mesh = new THREE.Mesh(geo, clayMat(CLAY_DARK, 0.98))
    displaceIcosahedron(mesh, 0.38)
    root.add(mesh)
    const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), clayMat(CLAY, 0.95))
    blob.position.set(0.55, -0.35, 0.2)
    root.add(blob)
    return root
  }

  if (id === 'axt-anker') {
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 2.2, 10),
      clayMat(CLAY_DARK, 0.9)
    )
    shaft.rotation.z = Math.PI / 10
    root.add(shaft)
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.18, 0.55),
      clayMat(CLAY, 0.88)
    )
    blade.position.set(0.15, 0.55, 0)
    blade.rotation.z = -0.25
    root.add(blade)
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 6), clayMat(CLAY_LIGHT, 0.9))
    tip.position.set(0.85, 0.55, 0)
    tip.rotation.z = -Math.PI / 2
    root.add(tip)
    return root
  }

  if (id === 'metamorphose') {
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 1.1, 12), clayMat(CLAY_DARK, 0.98))
    lower.position.y = -0.55
    displaceIcosahedron(lower, 0.22)
    root.add(lower)
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 1.15, 24), clayMat(CLAY_LIGHT, 0.75))
    upper.position.y = 0.55
    root.add(upper)
    for (let i = 0; i < 8; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.025, 6, 24),
        clayMat(CLAY_DARK, 0.6)
      )
      ring.position.y = 0.15 + i * 0.12
      ring.rotation.x = Math.PI / 2
      root.add(ring)
    }
    return root
  }

  if (id === 'code-muster') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 1.0, 2, 2, 2), clayMat(CLAY, 0.7))
    root.add(body)
    for (let row = -2; row <= 2; row++) {
      for (let col = -2; col <= 2; col++) {
        if ((row + col) % 2 !== 0) continue
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.06, 0.22),
          clayMat(CLAY_DARK, 0.55)
        )
        tile.position.set(col * 0.28, row * 0.28, 0.52)
        root.add(tile)
      }
    }
    return root
  }

  if (id === 'drei-elemente') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.55), clayMat(CLAY_DARK, 0.9))
    a.position.set(-0.35, -0.2, 0)
    a.rotation.y = 0.4
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.1, 10), clayMat(CLAY, 0.88))
    b.position.set(0.35, 0.1, 0.1)
    b.rotation.z = 0.35
    const c = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 10, 20), clayMat(CLAY_LIGHT, 0.8))
    c.position.set(0, 0.55, -0.15)
    c.rotation.x = Math.PI / 3
    root.add(a, b, c)
    return root
  }

  if (id === 'skizze-zwei-tuerme') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.15), clayMat(CLAY_DARK, 0.95))
    body.position.y = -0.35
    displaceIcosahedron(body, 0.12)
    root.add(body)
    for (let i = 0; i < 4; i++) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.55 + i * 0.05, 0.08, 8, 20), clayMat(CLAY, 0.85))
      loop.position.set(0, -0.1 + i * 0.12, 0.35)
      loop.rotation.y = i * 0.4
      root.add(loop)
    }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.35, 0.35), clayMat(CLAY_LIGHT, 0.8))
    tower.position.set(-0.25, 0.85, 0)
    root.add(tower)
    for (let i = 0; i < 6; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.4), clayMat(CLAY_DARK, 0.7))
      step.position.set(-0.25, 0.35 + i * 0.18, 0)
      root.add(step)
    }
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.15, 0.55), clayMat(CLAY, 0.75))
    slab.position.set(0.45, 0.75, 0.05)
    slab.rotation.z = -0.25
    root.add(slab)
    return root
  }

  if (id === 'skizze-segel') {
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 18), clayMat(CLAY_DARK, 0.98))
    base.position.y = -0.55
    base.scale.set(1.15, 0.85, 1.1)
    displaceIcosahedron(base, 0.2)
    root.add(base)
    const sailL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 2.0, 3), clayMat(CLAY_LIGHT, 0.55))
    sailL.position.set(-0.25, 0.85, 0)
    sailL.rotation.z = 0.35
    const sailR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 2.0, 3), clayMat(CLAY_LIGHT, 0.55))
    sailR.position.set(0.25, 0.85, 0)
    sailR.rotation.z = -0.35
    root.add(sailL, sailR)
    const plane = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.6, 1.1), clayMat(CLAY, 0.6))
    plane.position.set(0, 0.7, 0)
    root.add(plane)
    return root
  }

  if (id === 'skizze-kelch') {
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 16), clayMat(CLAY_DARK, 0.9))
    foot.position.y = -0.7
    foot.scale.set(1.1, 0.95, 1.1)
    root.add(foot)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.45, 0.85, 16), clayMat(CLAY, 0.85))
    neck.position.y = 0.15
    root.add(neck)
    const wingL = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 4), clayMat(CLAY_LIGHT, 0.7))
    wingL.position.set(-0.45, 1.0, 0)
    wingL.rotation.z = 0.55
    const wingR = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 4), clayMat(CLAY_LIGHT, 0.7))
    wingR.position.set(0.45, 1.0, 0)
    wingR.rotation.z = -0.55
    root.add(wingL, wingR)
    return root
  }

  if (id === 'skizze-astwerk') {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 1.6, 12), clayMat(CLAY_DARK, 0.9))
    trunk.position.y = -0.2
    root.add(trunk)
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.4, 6), clayMat(CLAY, 0.75))
    horn.position.set(-0.55, 0.85, 0)
    horn.rotation.z = 0.85
    root.add(horn)
    const peak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.5, 4), clayMat(CLAY_LIGHT, 0.7))
    peak.position.set(0, 1.2, -0.1)
    root.add(peak)
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.12, 0.7, 12), clayMat(CLAY, 0.8))
    cup.position.set(0.55, 0.95, 0.15)
    cup.rotation.z = -0.55
    root.add(cup)
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.35), clayMat(CLAY_LIGHT, 0.75))
    blade.position.set(0.7, 0.55, -0.2)
    blade.rotation.z = -0.2
    root.add(blade)
    return root
  }

  if (id === 'skizze-zickzack') {
    for (let i = 0; i < 5; i++) {
      const s = 1.2 - i * 0.18
      const chev = new THREE.Mesh(
        new THREE.BoxGeometry(s, 0.22, s * 0.7),
        clayMat(i % 2 === 0 ? CLAY_DARK : CLAY, 0.8)
      )
      chev.position.y = -0.7 + i * 0.35
      chev.rotation.y = Math.PI / 4
      root.add(chev)
    }
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.55, 4), clayMat(CLAY_DARK, 0.7))
    cap.position.y = 1.15
    root.add(cap)
    return root
  }

  return root
}

type Props = {
  modelId: HundredGenerationModellId
  className?: string
}

/**
 * Drehbares 3D-Konzeptmodell (Orbit). Kein Scan aus dem KI-Bild –
 * skulpturale Annäherung zum Weiterarbeiten der Form.
 */
export default function KeramikModell3D({ modelId, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    const w = host.clientWidth || 480
    const h = Math.max(280, Math.round(w * 0.72))

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x12151c)

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 40)
    camera.position.set(2.6, 1.6, 3.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    host.appendChild(renderer.domElement)

    const hemi = new THREE.HemisphereLight(0xfff2e0, 0x2a241c, 1.05)
    scene.add(hemi)
    const key = new THREE.DirectionalLight(0xffffff, 1.15)
    key.position.set(4, 6, 3)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xa8b8d0, 0.35)
    fill.position.set(-3, 1, -2)
    scene.add(fill)

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 48),
      new THREE.MeshStandardMaterial({ color: 0x1a1e28, roughness: 0.95, metalness: 0 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.15
    scene.add(floor)

    const modell = buildModell(modelId)
    modell.position.y = -0.15
    scene.add(modell)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 1.6
    controls.maxDistance = 7
    controls.target.set(0, 0.1, 0)
    controls.update()

    const onResize = () => {
      if (disposed || !hostRef.current) return
      const nw = hostRef.current.clientWidth || w
      const nh = Math.max(280, Math.round(nw * 0.72))
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const tick = () => {
      if (disposed) return
      raf = requestAnimationFrame(tick)
      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const m = obj.material
          if (Array.isArray(m)) m.forEach((x) => x.dispose())
          else m?.dispose()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement)
    }
  }, [modelId])

  return (
    <div className={className} style={{ width: '100%', touchAction: 'none' }}>
      <div ref={hostRef} style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }} />
      <p
        style={{
          margin: '0.55rem 0 0',
          fontSize: '0.78rem',
          color: 'rgba(200, 190, 175, 0.85)',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        Ziehen = drehen · Scrollen = zoom · Finger auf dem Tablet ebenso
      </p>
    </div>
  )
}
