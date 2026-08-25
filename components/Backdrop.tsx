"use client";

import { useEffect, useRef } from "react";

/**
 * Фон всей страницы: текучее поле на WebGL и молнии поверх него.
 * Оба холста прибиты к окну и лежат под содержимым, поэтому секции
 * остаются прозрачными и живут на одном общем фоне.
 *
 * Если WebGL недоступен или включено «уменьшить движение» — остаётся
 * статичный градиент того же тона.
 */

const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";

const FRAG = `precision highp float;
uniform vec2 u_res; uniform float u_t; uniform vec2 u_m; uniform float u_int; uniform float u_push;
uniform vec3 cBg; uniform vec3 cA; uniform vec3 cB; uniform vec3 cC;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<7;i++){ v += a*noise(p); p *= 2.11; a *= 0.55; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  float asp = u_res.x / u_res.y;
  vec2 p = uv; p.x *= asp;
  vec2 mp = u_m; mp.x *= asp;
  vec2 d = p - mp;
  float dl = length(d) + 0.0001;
  p += (d / dl) * smoothstep(0.45, 0.0, dl) * smoothstep(0.0, 0.14, dl) * 0.10 * u_push;
  float t = u_t * 0.055;
  vec2 q = vec2(fbm(p*2.3 + t*0.7), fbm(p*2.3 + vec2(5.2,1.3) - t*0.5));
  vec2 r = vec2(fbm(p*2.8 + q*2.2 + vec2(1.7,9.2) + t*0.35), fbm(p*2.8 + q*2.2 + vec2(8.3,2.8) - t*0.28));
  float f = fbm(p*3.4 + r*1.7);
  float det = fbm(p*8.5 + r*2.4 + t*0.5);
  f = mix(f, det, 0.22);
  vec3 col = mix(cBg, cA, smoothstep(0.30, 0.72, f));
  col = mix(col, cB, smoothstep(0.30, 0.86, length(q)) * 0.95);
  col = mix(col, cC, smoothstep(0.36, 0.74, r.x) * 0.9);
  col += cC * 0.30 * pow(smoothstep(0.55, 0.92, f), 2.0);
  col += cC * 0.10 * smoothstep(0.62, 0.95, det);
  col *= 0.62 + 0.80 * smoothstep(1.75, 0.05, length((uv - vec2(0.52, 0.52)) * vec2(0.9, 1.0)));
  col = mix(cBg, col, u_int);
  float g = hash(gl_FragCoord.xy + fract(u_t)) * 0.04;
  gl_FragColor = vec4(col + g - 0.02, 1.0);
}`;

/* Настройки фона — те же значения, что и в макете */
const ACCENT = "#4b6fe8";
const BOLT_COLORS = ["#ff3b3b", "#4b6fe8"];
const BOLT_EVERY = 1.5; // секунды между разрядами
const INTENSITY = 1;
const MOUSE_PUSH = 0.7;

type Bolt = {
  pts: [number, number][];
  forks: [number, number][][];
  t0: number;
  life: number;
  w: number;
  col: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const s = hex.replace("#", "");
  const v = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  const n = parseInt(v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const scaleColor = (c: number[], k: number) => c.map((v) => Math.min(1, v * k));

export default function Backdrop() {
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const boltRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const bolt = boltRef.current;
    if (!field || !bolt) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fallback = () => {
      field.style.background = "radial-gradient(80% 60% at 60% 10%, #1d2a63, #0b0d18)";
    };

    if (reduce) {
      fallback();
      return;
    }

    let dpr = 1;
    let rafField = 0;
    let rafBolt = 0;

    /* ---------- текучее поле ---------- */

    const gl = field.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) fallback();

    const base = hexToRgb(ACCENT);
    const cA = scaleColor(base, 0.55);
    const cB = base;
    const cC = scaleColor(base, 1.65);
    const cBg = [0.043, 0.051, 0.094];

    const mouse = { x: 0.5, y: 0.55, tx: 0.5, ty: 0.55 };
    let speed = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const canvas of [field, bolt]) {
        canvas.width = Math.max(2, Math.floor(canvas.clientWidth * dpr));
        canvas.height = Math.max(2, Math.floor(canvas.clientHeight * dpr));
      }
      if (gl) gl.viewport(0, 0, field.width, field.height);
    };

    if (gl) {
      const compile = (type: number, src: string) => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      };

      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        fallback();
      } else {
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, "a");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const u = (name: string) => gl.getUniformLocation(program, name);
        const uniforms = {
          res: u("u_res"),
          t: u("u_t"),
          m: u("u_m"),
          int: u("u_int"),
          push: u("u_push"),
          bg: u("cBg"),
          a: u("cA"),
          b: u("cB"),
          c: u("cC"),
        };

        resize();
        const t0 = performance.now();

        const loop = (now: number) => {
          mouse.x += (mouse.tx - mouse.x) * 0.05;
          mouse.y += (mouse.ty - mouse.y) * 0.05;
          speed *= 0.975;

          gl.uniform2f(uniforms.res, field.width, field.height);
          gl.uniform1f(uniforms.t, (now - t0) / 1000);
          gl.uniform2f(uniforms.m, mouse.x, mouse.y);
          gl.uniform1f(uniforms.int, INTENSITY);
          gl.uniform1f(uniforms.push, MOUSE_PUSH * (0.7 + speed * 0.3));
          gl.uniform3fv(uniforms.bg, cBg);
          gl.uniform3fv(uniforms.a, cA);
          gl.uniform3fv(uniforms.b, cB);
          gl.uniform3fv(uniforms.c, cC);
          gl.drawArrays(gl.TRIANGLES, 0, 3);

          rafField = requestAnimationFrame(loop);
        };
        rafField = requestAnimationFrame(loop);
      }
    }

    /* ---------- молнии ---------- */

    const makeBolt = (w: number, h: number): Bolt => {
      const segments = 16 + Math.floor(Math.random() * 8);
      const x0 = w * (0.08 + Math.random() * 0.84);
      const drift = (Math.random() - 0.5) * w * 0.22;
      const len = h * (0.85 + Math.random() * 0.4);
      const y0 = -h * 0.05;

      const pts: [number, number][] = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        pts.push([x0 + drift * t + (Math.random() - 0.5) * w * 0.035, y0 + len * t]);
      }

      const forks: [number, number][][] = [];
      const count = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < count; k++) {
        const at = 4 + Math.floor(Math.random() * (segments - 6));
        const fork: [number, number][] = [pts[at]];
        const dir = Math.random() < 0.5 ? -1 : 1;
        const steps = 3 + Math.floor(Math.random() * 4);
        for (let i = 1; i <= steps; i++) {
          const prev = fork[i - 1];
          fork.push([
            prev[0] + dir * w * (0.012 + Math.random() * 0.03),
            prev[1] + h * (0.018 + Math.random() * 0.025),
          ]);
        }
        forks.push(fork);
      }

      return {
        pts,
        forks,
        t0: performance.now(),
        life: 260 + Math.random() * 220,
        w: 0.8 + Math.random() * 0.9,
        col: BOLT_COLORS[Math.floor(Math.random() * BOLT_COLORS.length)],
      };
    };

    const strokeBolt = (ctx: CanvasRenderingContext2D, b: Bolt) => {
      ctx.beginPath();
      b.pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
      b.forks.forEach((fork) =>
        fork.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])))
      );
      ctx.stroke();
    };

    let bolts: Bolt[] = [];
    let nextAt = 0;

    const drawBolts = (now: number) => {
      rafBolt = requestAnimationFrame(drawBolts);
      const ctx = bolt.getContext("2d");
      if (!ctx) return;

      if (!nextAt) nextAt = now + 600;
      if (now >= nextAt) {
        bolts.push(makeBolt(bolt.width, bolt.height));
        nextAt = now + BOLT_EVERY * 1000 * (0.75 + Math.random() * 0.5);
      }

      ctx.clearRect(0, 0, bolt.width, bolt.height);
      if (!bolts.length) return;

      bolts = bolts.filter((b) => {
        const age = now - b.t0;
        if (age > b.life) return false;

        const p = age / b.life;
        // вспышка, короткий провал, полная яркость, затухание
        let alpha = p < 0.08 ? p / 0.08 : p < 0.18 ? 0.35 : p < 0.3 ? 0.95 : 1 - (p - 0.3) / 0.7;
        alpha = Math.max(0, alpha * 0.9);

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = b.col;
        ctx.shadowColor = b.col;

        // четыре прохода: ореол, свечение, тело, белая жила
        const passes: [number, number, number][] = [
          [54, 9, 0.14],
          [28, 4, 0.3],
          [12, 1.8, 0.65],
        ];
        for (const [blur, width, a] of passes) {
          ctx.shadowBlur = blur * dpr;
          ctx.lineWidth = b.w * dpr * width;
          ctx.globalAlpha = alpha * a;
          strokeBolt(ctx, b);
        }
        ctx.strokeStyle = "#fff";
        ctx.shadowBlur = 8 * dpr;
        ctx.lineWidth = b.w * dpr * 0.8;
        ctx.globalAlpha = alpha;
        strokeBolt(ctx, b);

        if (p < 0.3) {
          ctx.globalAlpha = alpha * 0.05;
          ctx.shadowBlur = 0;
          ctx.fillStyle = b.col;
          ctx.fillRect(0, 0, bolt.width, bolt.height);
        }
        ctx.restore();
        return true;
      });
    };

    resize();
    rafBolt = requestAnimationFrame(drawBolts);

    const onMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth;
      const ny = 1 - event.clientY / window.innerHeight;
      speed = Math.min(1, speed + Math.hypot(nx - mouse.tx, ny - mouse.ty) * 2);
      mouse.tx = nx;
      mouse.ty = ny;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafField);
      cancelAnimationFrame(rafBolt);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-1]">
      <canvas ref={fieldRef} className="absolute inset-0 block h-full w-full" />
      <canvas
        ref={boltRef}
        className="absolute inset-0 block h-full w-full"
        style={{ mixBlendMode: "screen" }}
      />
      {/* Виньетка: гасит фон там, где начинается текст */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 70% 10%, transparent 30%, rgba(11,13,24,.72) 100%)",
        }}
      />
      {/* Скрим поверх фона: без него мелкий текст тонет в ярких пятнах шейдера */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,11,22,.62), rgba(9,11,22,.74) 55%, rgba(9,11,22,.82)), radial-gradient(70% 60% at 18% 30%, rgba(9,11,22,.34), transparent 70%)",
        }}
      />
    </div>
  );
}
