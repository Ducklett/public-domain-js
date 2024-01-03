export class ShaderElement extends HTMLElement {
    rootContainer: HTMLDivElement;

    mouse = { x: .5, y: .5 }
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    contentElement?: HTMLElement;

    constructor() {
        super()

        const children = this.children


        if (this.children.length > 1) {
            throw new Error('Shader should have a single child element containing the content, actual child count was ' + this.children.length)
        }

        this.contentElement = this.children[0] as HTMLElement


        window.addEventListener('mousemove', e => {
            const local = this.getAttribute('mousepos') == 'local'
            if (local) {
                const rect = this.getBoundingClientRect()
                this.mouse.x = (e.clientX - rect.x) / rect.width
                this.mouse.y = (e.clientY - rect.y) / rect.height
            } else {
                this.mouse.x = e.clientX / window.innerWidth
                this.mouse.y = e.clientY / window.innerHeight
            }
        })



        this.rootContainer = document.createElement('div')
        this.rootContainer.setAttribute('style', this.getAttribute('style') ?? '')
        this.rootContainer.style.position = 'relative'

        this.rootContainer.append(...children)

        this.appendChild(this.rootContainer)

        const src = this.getAttribute('src')
        if (src) {
            this.loadShaderFromUrl(src)
        }

        const resizeObserver = new ResizeObserver(this.resizeCanvas.bind(this));

        // Attach the ResizeObserver to the body
        resizeObserver.observe(this.rootContainer);

    }

    resizeCanvas() {
        // TODO: fix this to resize when the canvas is loaded
        if (!this.canvas) return
        const width = this.canvas.offsetWidth
        const height = this.canvas.offsetHeight
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    loadShaderFromUrl(src: string) {
        fetch(src).then(dt => dt.text()).then(text => {
            // Vertex shader program
            const vsSource = `#version 300 es

    in vec4 aVertexPosition;

    void main(void) {
        gl_Position = aVertexPosition;
    }
`;

            // Fragment shader program
            const fsSource = text ?? `#version 300 es

    precision highp float;

    uniform float time;
    uniform float deltaTime;
    uniform vec2 mouse;
    uniform float width;
    uniform float height;

    out vec4 fragColor;

    void main(void) {
        fragColor = vec4(1.0,0.0,1.0, 1.0);
    }
`;

            // Initialize WebGL
            const canvas = document.createElement('canvas');
            this.canvas = canvas
            this.rootContainer.appendChild(canvas);
            canvas.setAttribute('style', 'position: absolute; width:100%;height:100%; top:0;left:0;z-index:-1;')

            const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
            if (!gl) {
                console.error('Unable to initialize WebGL. Your browser may not support it.');
            }
            this.gl = gl

            this.resizeCanvas()

            // Create shader program
            function compileShader(type: GLenum, source: string): WebGLShader {
                const shader = gl.createShader(type);
                if (!shader) {
                    throw new Error('Unable to create shader.');
                }

                gl.shaderSource(shader, source);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error(gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    throw new Error('Shader compilation failed.');
                }

                return shader;
            }

            const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
            const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

            const shaderProgram = gl.createProgram();
            if (!shaderProgram) {
                throw new Error('Unable to create shader program.');
            }

            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return
            }

            gl.useProgram(shaderProgram);

            // Create buffer and attribute for a fullscreen quad
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
            gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionAttribLocation);

            // Set up uniforms
            const timeUniform = gl.getUniformLocation(shaderProgram, 'time');
            const deltaTimeUniform = gl.getUniformLocation(shaderProgram, 'deltaTime');
            const mouseUniform = gl.getUniformLocation(shaderProgram, 'mouse');
            const widthUniform = gl.getUniformLocation(shaderProgram, 'width');
            const heightUniform = gl.getUniformLocation(shaderProgram, 'height');

            // Render loop
            let prevT = 0
            function startRender(t) {
                prevT = t
                render.bind(this)(t)

                if (this.contentElement) {
                    this.contentElement.style.background = 'unset'
                }
            }

            function render(t) {
                const dt = t - prevT
                prevT = t
                // Update uniforms
                gl.uniform1f(timeUniform, t / 1000);
                gl.uniform1f(deltaTimeUniform, dt);
                gl.uniform2f(mouseUniform, 1 - this.mouse.x, this.mouse.y); // Example normalized mouse coordinates
                gl.uniform1f(widthUniform, canvas.width);
                gl.uniform1f(heightUniform, canvas.height);

                // Clear the canvas
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                // Draw the fullscreen quad
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                // Request the next frame
                requestAnimationFrame(render.bind(this));
            }
            requestAnimationFrame(startRender.bind(this))
        })
    }
}

customElements.define('ks-shader', ShaderElement)