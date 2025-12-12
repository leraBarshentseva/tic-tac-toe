import { useRef, useEffect } from 'react';

const FluidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    // Fragment shader program (The Liquid Logic)
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Random function
      float random(in vec2 _st) {
        return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      // Noise function
      float noise(in vec2 _st) {
        vec2 i = floor(_st);
        vec2 f = fract(_st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      // Fractal Brownian Motion
      float fbm(in vec2 _st) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        // Rotate to reduce axial bias
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(_st);
          _st = rot * _st * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        st.x *= aspect;

        vec2 mouse = u_mouse / u_resolution.xy;
        mouse.x *= aspect;
        
        // Slower time for relaxed feel
        float t = u_time * 0.1;

        // Domain warping pattern
        vec2 q = vec2(0.);
        q.x = fbm(st + 0.1 * t);
        q.y = fbm(st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
        r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

        // Interactive mouse ripple
        float dist = distance(st, vec2(mouse.x, 1.0 - mouse.y));
        float mouseEffect = smoothstep(0.4, 0.0, dist) * 0.15;
        
        float f = fbm(st + r + mouseEffect);

        // Color Palette: Rose, White, Soft Champagne
        // Mix 1: Base smooth pink
        vec3 color = mix(
            vec3(1.0, 0.95, 0.96), // rose-50
            vec3(0.99, 0.85, 0.88), // rose-100/200
            clamp((f*f)*4.0, 0.0, 1.0)
        );

        // Mix 2: Deeper rose accents
        color = mix(
            color,
            vec3(0.98, 0.65, 0.7), // rose-300ish
            clamp(length(q), 0.0, 1.0)
        );

        // Mix 3: White highlights (foam/reflection)
        color = mix(
            color,
            vec3(1.0, 1.0, 1.0),
            clamp(length(r.x), 0.0, 1.0) * 0.5
        );

        // Vignette
        float vignette = 1.0 - smoothstep(0.5, 1.5, length(st - vec2(aspect*0.5, 0.5)));
        color *= (0.95 + 0.05 * vignette);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Initialize Shader
    const initShaderProgram = (gl: WebGLRenderingContext, vs: string, fs: string) => {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
      if (!vertexShader || !fragmentShader) return null;

      const shaderProgram = gl.createProgram();
      if (!shaderProgram) return null;

      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }
      return shaderProgram;
    };

    const loadShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) return;

    // Attribute & Uniform Locations
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    const uResolution = gl.getUniformLocation(shaderProgram, 'u_resolution');
    const uTime = gl.getUniformLocation(shaderProgram, 'u_time');
    const uMouse = gl.getUniformLocation(shaderProgram, 'u_mouse');

    // Setup Buffer (Full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Resize Handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Mouse Handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Render Loop
    let animationFrameId: number;
    const render = () => {
      const currentTime = (Date.now() - startTimeRef.current) / 1000;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(shaderProgram);

      // Bind vertex position
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vertexPosition);

      // Set uniforms
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, currentTime);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />;
};

export default FluidBackground;