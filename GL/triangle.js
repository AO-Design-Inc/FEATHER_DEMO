var vertexShaderText =
    [
        'precision mediump float;',
        '',
        'attribute vec2 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition, 0.0, 1.0);',
        '}'
    ].join('\n');
var fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        '  gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n');
let setup = function () {
    // Setup
    console.log('Setup')
    const canvas = document.getElementById('canvas')
    const gl = canvas.getContext('webgl')
    if (!gl) gl = canvas.getContext('experimental-webgl')
    if (!gl) alert("Yourbrowser doesn't support webgl")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, window.innerWidth, window.innerHeight)
    // Setup End ======

    // Background Clear
    gl.clearColor(0.067, 0.075, 0.11, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // Background Clear End

    return gl
}
let shaders = function (gl, vert, frag) {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER)
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vertexShader, vert)
    gl.shaderSource(fragmentShader, frag)

    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('vertexshader not compiled', gl.getShaderInfoLog(vertexShader))
        return
    }
    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('fragmentshader not compiled', gl.getShaderInfoLog(fragmentShader))
        return
    }

    let program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR LINKING: ', gl.getProgramInfoLog(program))
        return
    }
    gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR VALIDATING: ', gl.getProgramInfoLog(program))
        return
    }
    return program
}
function main() {
    let gl = setup()
    let program = shaders(gl, vertexShaderText, fragmentShaderText)

    //Create Buffer
    let triangleVertices =
        [
            // X,   Y,      R,  G,  B
            0.0, 0.5, 1.0, 1.0, 0.0,
            -0.5, -0.5, 0.7, 0.0, 1.0,
            0.5, -0.5, 0.1, 1.0, 0.6
        ]
    let triangleVertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
    gl.vertexAttribPointer(
        positionAttribLocation, // attribute location
        2, // number of elements
        gl.FLOAT, // type
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of vertex
        0 // offset from beginning of vertex to this attribute
    )
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    )
    gl.enableVertexAttribArray(positionAttribLocation)
    gl.enableVertexAttribArray(colorAttribLocation)
    // Create Buffer End ======

    // Main Loop
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}