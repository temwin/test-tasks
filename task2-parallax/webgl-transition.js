// webgl-transition.js
class WebGLTransition {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");
    this.program = null;
    this.textures = [null, null];
    this.currentIndex = 0;
    this.nextIndex = 1;
    this.progress = 0;
    this.direction = 1;
    this.isAnimating = false;

    this.initGL();
  }

  initGL() {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    this.createProgram();

    this.createPlane();

    this.u_progress = this.gl.getUniformLocation(this.program, "u_progress");
    this.u_direction = this.gl.getUniformLocation(this.program, "u_direction");
    this.u_texture1 = this.gl.getUniformLocation(this.program, "u_texture1");
    this.u_texture2 = this.gl.getUniformLocation(this.program, "u_texture2");
    this.u_resolution = this.gl.getUniformLocation(
      this.program,
      "u_resolution"
    );

    this.gl.uniform2f(this.u_resolution, this.canvas.width, this.canvas.height);
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  createProgram() {
    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        
        void main() {
          gl_Position = vec4(a_position, 0, 1);
          v_texCoord = a_position * 0.5 + 0.5;
        }
      `
    );

    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      `
precision mediump float;

uniform float u_progress;
uniform float u_direction;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform vec2 u_resolution;

varying vec2 v_texCoord;

float rand(vec2 seed) {
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 coord1 = v_texCoord;
    vec2 coord2 = v_texCoord;

    if (u_progress > 0.0 && u_progress < 1.0) {
        // Параметры эффекта (можно вынести в uniform или константы)
        float moveSpeed = 1.2;       // скорость смещения
        float stretchPower = 0.2;     // сила растяжения (максимальное дополнительное смещение краев)

        // Прогресс для уходящей картинки
        float p = u_progress;

        // Смещение для уходящей: линейно зависит от p, плюс растяжение
        // Растяжение: чем дальше от центра, тем больше смещение
        float dist1 = abs(coord1.x - 0.5) * 2.0; // от 0 до 1 (0 в центре, 1 на краю)
        float stretch1 = dist1 * stretchPower * p;
        float offset1 = u_direction * (p * moveSpeed + stretch1);

        // Применяем смещение к первой картинке
        coord1.x = coord1.x + offset1;

        // Для второй картинки (приходящая) смещение противоположное, и оно уменьшается с прогрессом
        float dist2 = abs(coord2.x - 0.5) * 2.0;
        float stretch2 = dist2 * stretchPower * (1.0 - p);
        float offset2 = -u_direction * ((1.0 - p) * moveSpeed + stretch2);

        coord2.x = coord2.x + offset2;
        coord1.x = clamp(coord1.x + offset1, 0.0, 1.0);
        coord2.x = clamp(coord2.x + offset2, 0.0, 1.0);

        // Добавляем немного шума для эффекта размытия
        float noise1 = rand(vec2(coord1.y, p)) * 0.02;
        float noise2 = rand(vec2(coord2.y, p)) * 0.02;
        coord1.x += noise1;
        coord2.x += noise2;
    }

    vec4 color1 = texture2D(u_texture1, coord1);
    vec4 color2 = texture2D(u_texture2, coord2);

    // Плавное смешивание
    float mixFactor = u_progress;
    gl_FragColor = mix(color1, color2, mixFactor);
}
      `
    );

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", this.gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  createPlane() {
    const vertices = new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
  }

  loadImage(src, index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const texture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0 + index);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          img
        );

        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.LINEAR
        );

        this.textures[index] = texture;
        resolve();
      };
      img.src = src;
    });
  }

  async loadImages(sources) {
    await Promise.all([
      this.loadImage(sources[0], 0),
      this.loadImage(sources[1], 1),
    ]);

    this.render(0);
  }

  render(progress) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[0]);
    this.gl.uniform1i(this.u_texture1, 0);

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[1]);
    this.gl.uniform1i(this.u_texture2, 1);

    this.gl.uniform1f(this.u_progress, progress);
    this.gl.uniform1f(this.u_direction, this.direction);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  startTransition(nextIndex, direction, onComplete, onUpdate) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.direction = direction === "right" ? 1 : -1;
    this.nextIndex = nextIndex;

    let startTime = null;
    const duration = 850;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      this.progress = Math.min(elapsed / duration, 1);

      this.render(this.progress);

      if (onUpdate) onUpdate(this.progress, this.direction);

      if (this.progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.progress = 0;
        this.isAnimating = false;
        this.currentIndex = this.nextIndex;
        [this.textures[0], this.textures[1]] = [
          this.textures[1],
          this.textures[0],
        ];
        if (onComplete) onComplete();
      }
    };
    requestAnimationFrame(animate);
  }
}
