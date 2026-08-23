"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { animate, motionValue } from "framer-motion"

const RMAX = 1400
const FOV = 34
const DPR_CAP = 1.5
const TAU = Math.PI * 2

const VERT = `
precision highp float;
attribute vec4 aRing;
uniform vec2 uRes;
uniform float uFocal;
uniform float uDist;
uniform float uPitchCam;
uniform float uRoll;
uniform float uSpin;
uniform float uDot;
uniform float uMorphT;
uniform float uVoidR;
uniform float uEdgeW;
uniform vec3 uCols[5];
uniform int uColN;
uniform float uDepthFade;
uniform float uWaveAmp;
uniform float uWaveFreq;
uniform float uWaveT;
varying vec3 vCol;
varying float vA;

#define PI 3.14159265
#define TAU 6.28318530
#define RMAX 1400.0

float sdfCircle(vec2 p, float r) { return length(p) - r; }
float sdfPentagon(vec2 p, float r) {
    float sector = TAU / 5.0;
    float a = atan(p.y, p.x);
    float fa = mod(a + PI / 5.0, sector) - sector * 0.5;
    return length(p) * cos(fa) - r * cos(PI / 5.0);
}
float sdfHeart(vec2 p, float r) {
    vec2 q = p / max(r, 0.001);
    q.y = -q.y - 0.2;
    q.x = abs(q.x);
    vec2 a = q - vec2(0.25, 0.75);
    vec2 b = q - vec2(0.0, 1.0);
    vec2 c2 = q - vec2(0.5, 0.0);
    float region = clamp(q.y + q.x - 1.0, 0.0, 1.0);
    float da = sqrt(dot(a, a)) - sqrt(0.5) * 0.5;
    float db = min(sqrt(dot(b, b)), sqrt(dot(c2, c2))) - 0.5;
    return mix(db, da, region) * r;
}
float voidSDF(vec2 p, float r) {
    float dC = sdfCircle(p, r);
    float dP = sdfPentagon(p, r * 0.90);
    float dH = sdfHeart(p, r * 1.10);
    float t3 = uMorphT * 3.0;
    float seg = floor(t3);
    float f = fract(t3);
    float sf = f * f * (3.0 - 2.0 * f);
    float d01 = mix(dC, dP, sf);
    float d12 = mix(dP, dH, sf);
    float d20 = mix(dH, dC, sf);
    return mix(mix(d01, d12, step(1.0, seg)), d20, step(2.0, seg));
}
vec3 pickCol(float t) {
    int n = uColN;
    int idx = int(floor(clamp(t, 0.0, 0.9999) * float(n)));
    vec3 c = uCols[0];
    for (int i = 0; i < 5; i++) {
        if (i >= n) break;
        if (i == idx) c = uCols[i];
    }
    return c;
}
void main() {
    float normR = aRing.x;
    float theta = aRing.y;
    float normBnd = aRing.z;
    float jitter = aRing.w;
    float angle = theta + uSpin;
    float r = normR * RMAX;
    float px = r * cos(angle);
    float pz = r * sin(angle);
    float vd = voidSDF(vec2(px, pz), uVoidR);
    float edgeT = 1.0 - smoothstep(0.0, uEdgeW * 2.0, abs(vd));
    float maskA = smoothstep(-uEdgeW, uEdgeW, vd);
    float kFreq = uWaveFreq * TAU / RMAX;
    float wavePhaseR = r * kFreq - uWaveT;
    float wavePhaseX = px * kFreq - uWaveT * 0.71;
    float py = (sin(wavePhaseR) * 0.65 + sin(wavePhaseX) * 0.35) * uWaveAmp;
    py *= smoothstep(0.0, uEdgeW * 3.0, vd);
    float bandBri = 0.38 + (1.0 - normBnd) * 0.62;
    float bsd = 0.3 + jitter * 0.7;
    float c = cos(uPitchCam);
    float s = sin(uPitchCam);
    float ry = py * c + pz * s;
    float rz = uDist - py * s + pz * c;
    if (rz < 30.0) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        gl_PointSize = 0.0;
        vA = 0.0;
        vCol = uCols[0];
        return;
    }
    float cr = cos(uRoll);
    float sr = sin(uRoll);
    float sx = (px * cr - ry * sr) * uFocal / rz;
    float sy = (px * sr + ry * cr) * uFocal / rz;
    gl_Position = vec4(sx / (uRes.x * 0.5), sy / (uRes.y * 0.5), 0.0, 1.0);
    float szv = 0.5 + bsd * 1.5;
    gl_PointSize = clamp(uDot * uFocal / rz * szv, 1.0, 28.0);
    vec3 col = pickCol(jitter);
    vec3 hi = pickCol(1.0);
    col = mix(col, hi, edgeT);
    col = mix(col, vec3(1.0), edgeT * 0.30);
    float waveHi = max(0.0, py / max(uWaveAmp, 0.001));
    col = mix(col, hi, waveHi * 0.25);
    float dep = 1.0 - uDepthFade * smoothstep(uDist * 0.6, uDist * 1.6, rz);
    float bri = (0.28 + bsd * 0.72) * bandBri * (1.0 + edgeT * 2.5);
    bri *= 1.0 + waveHi * 0.40;
    vCol = col;
    vA = clamp(bri * dep * maskA, 0.0, 3.0);
}
`

const FRAG = `
precision highp float;
varying vec3 vCol;
varying float vA;
void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float a = vA * (1.0 - smoothstep(0.5, 1.0, d));
    gl_FragColor = vec4(vCol * a, a);
}
`

function parseColor(input: string): [number, number, number] {
    if (!input) return [0, 0, 0]
    const s = input.trim()
    const fn = s.match(/rgba?\(([^)]+)\)/i)
    if (fn) {
        const p = fn[1].split(",").map((v) => parseFloat(v.trim()))
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }
    let h = s.replace("#", "")
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("")
    h = h.padEnd(6, "0")
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ]
}

function mulberry32(a: number) {
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function gauss(rnd: () => number) {
    const u1 = Math.max(1e-9, rnd())
    const u2 = rnd()
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2)
    return Math.max(-3, Math.min(3, g))
}

function compile(gl: WebGLRenderingContext, type: number, src: string, tag: string) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    return sh
}

const DEFAULT_COLORS = ["#2B2D31", "#C29B72", "#3A4027", "#8D321F", "#710014"]

export default function MorphingRingsHero() {
    const hoverMV = useRef(motionValue(0)).current
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const palette = DEFAULT_COLORS
    const colRGB = useRef(new Float32Array(5 * 3))
    for (let i = 0; i < palette.length; i++) {
        const [r, g, b] = parseColor(palette[i])
        colRGB.current[i * 3] = r
        colRGB.current[i * 3 + 1] = g
        colRGB.current[i * 3 + 2] = b
    }

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false }) as WebGLRenderingContext | null
        if (!gl) return

        const ringProg = gl.createProgram()!
        gl.attachShader(ringProg, compile(gl, gl.VERTEX_SHADER, VERT, "ring-vert"))
        gl.attachShader(ringProg, compile(gl, gl.FRAGMENT_SHADER, FRAG, "ring-frag"))
        gl.linkProgram(ringProg)

        gl.useProgram(ringProg)
        const aRing = gl.getAttribLocation(ringProg, "aRing")
        const Ur = (n: string) => gl.getUniformLocation(ringProg, n)
        const ur = {
            res: Ur("uRes"), focal: Ur("uFocal"), dist: Ur("uDist"),
            pitchCam: Ur("uPitchCam"), roll: Ur("uRoll"), spin: Ur("uSpin"),
            dot: Ur("uDot"), morphT: Ur("uMorphT"), voidR: Ur("uVoidR"),
            edgeW: Ur("uEdgeW"), cols: Ur("uCols[0]"), colN: Ur("uColN"),
            depthFade: Ur("uDepthFade"), waveAmp: Ur("uWaveAmp"),
            waveFreq: Ur("uWaveFreq"), waveT: Ur("uWaveT"),
        }

        const ringBuf = gl.createBuffer()!
        let ringCount = 2400
        const data = new Float32Array(ringCount * 4)
        const rnd = mulberry32(0x9a1b2c3)
        for (let i = 0; i < ringCount; i++) {
            data[i * 4] = rnd()
            data[i * 4 + 1] = rnd() * TAU
            data[i * 4 + 2] = rnd()
            data[i * 4 + 3] = rnd()
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE)

        let animId = 0
        let spinAcc = 0
        let waveAcc = 0

        const frame = (now: number) => {
            spinAcc += 0.003
            waveAcc += 0.02
            const morphT = (now * 0.00003) % 1.0

            gl.viewport(0, 0, canvas.width, canvas.height)
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.useProgram(ringProg)
            gl.uniform2f(ur.res, canvas.width, canvas.height)
            gl.uniform1f(ur.focal, canvas.height * 0.8)
            gl.uniform1f(ur.dist, 3600)
            gl.uniform1f(ur.pitchCam, 1.48)
            gl.uniform1f(ur.roll, 0)
            gl.uniform1f(ur.spin, spinAcc)
            gl.uniform1f(ur.dot, 4)
            gl.uniform1f(ur.morphT, morphT)
            gl.uniform1f(ur.voidR, 392)
            gl.uniform1f(ur.edgeW, 38)
            gl.uniform3fv(ur.cols, colRGB.current)
            gl.uniform1i(ur.colN, 5)
            gl.uniform1f(ur.depthFade, 0.55)
            gl.uniform1f(ur.waveAmp, 400)
            gl.uniform1f(ur.waveFreq, 4)
            gl.uniform1f(ur.waveT, waveAcc)

            gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf)
            gl.enableVertexAttribArray(aRing)
            gl.vertexAttribPointer(aRing, 4, gl.FLOAT, false, 16, 0)
            gl.drawArrays(gl.POINTS, 0, ringCount)

            animId = requestAnimationFrame(frame)
        }

        const resize = () => {
            canvas.width = host.clientWidth
            canvas.height = host.clientHeight
        }
        resize()
        window.addEventListener("resize", resize)
        animId = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener("resize", resize)
            gl.deleteProgram(ringProg)
            gl.deleteBuffer(ringBuf)
        }
    }, [])

    return (
        <div ref={hostRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    )
}
