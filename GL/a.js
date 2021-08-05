/* Licensed under a BSD license. See license.html for license */
"use strict";

function main() {
  // Get A WebGL context

  // Here we do this one 1 of 2 ways like many WebGL libraries. Either
  // we have a canvas on the page. Or else we have container and we
  // insert a canvas inside that container.
  // If we don't find a container we use the body of the document.
  var container = document.querySelector("#canvas") || document.body;
  var isCanvas = (container instanceof HTMLCanvasElement);
  var canvas = isCanvas ? container : document.createElement("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  if (!isCanvas) {
    container.appendChild(canvas);
  }
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  var bufferInfo = window.primitives.createSphereBufferInfo(gl, 5, 48, 24);

  // setup GLSL program
  var programInfo = webglUtils.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var cameraAngleRadians = degToRad(0);
  var fieldOfViewRadians = degToRad(40);
  var cameraHeight = 40;

  var uniformsThatAreTheSameForAllObjects = {
    u_lightWorldPos:         [-50, 30, 100],
    u_viewInverse:           m4.identity(),
    u_lightColor:            [1, 1, 1, 1],
  };

  var uniformsThatAreComputedForEachObject = {
    u_worldViewProjection:   m4.identity(),
    u_world:                 m4.identity(),
    u_worldInverseTranspose: m4.identity(),
  };

  var makeRandomTexture = function(gl, w, h) {
    var numPixels = w * h;
    var pixels = new Uint8Array(numPixels * 4);
    var strong = 4;randInt(3);
    for (var p = 0; p < numPixels; ++p) {
      var off = p * 4;
      pixels[off + 0] = rand(128, 256);
      pixels[off + 1] = rand(128, 256);
      pixels[off + 2] = rand(128, 256);
      pixels[off + 3] = 255;
    }
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
  };

  var rand = function(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return min + Math.random() * (max - min);
  };

  var randInt = function(range) {
    return Math.floor(Math.random() * range);
  };

  var textures = [];
  var numTextures = 3;
  for (var ii = 0; ii < numTextures; ++ii) {
    var texture = makeRandomTexture(gl, 4, 4);
    textures.push(texture);
  }

  var objects = [];
  var numObjects = 300;
  for (var ii = 0; ii < numObjects; ++ii) {
    objects.push({
      speed: 0.25,
      radius: 60,
      radius2: 10,
      xRotation: ii / (numObjects / 40) * Math.PI * 2,
      yRotation: ii / (numObjects / 1) * Math.PI * 2,
      materialUniforms: {
        u_ambient:               hsvToRgb(ii / numObjects, 1, 1),
        u_diffuse:               textures[ii % textures.length],
        u_specular:              [1, 1, 1, 1],
        u_shininess:             10 + ii / (numObjects / 4) * 200,
        u_specularFactor:        1,
      },
    });
  }

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    time *= 0.001;  // convert to seconds

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Set the viewport to match the canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = canvas.clientWidth / canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up, uniformsThatAreTheSameForAllObjects.u_viewInverse);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(programInfo.program);

    // Setup all the needed attributes.
    webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // Set the uniforms that are the same for all objects.
    webglUtils.setUniforms(programInfo, uniformsThatAreTheSameForAllObjects);

    // Draw objects
    objects.forEach(function(object) {

      // Compute a position for this object based on the time.
      var matrix = m4.identity(uniformsThatAreComputedForEachObject.u_world)
      matrix = m4.translate(matrix, 0, 0, object.radius2, matrix);
      matrix = m4.xRotate(matrix, object.xRotation + object.speed * time, matrix);
      matrix = m4.yRotate(matrix, object.yRotation + object.speed * time, matrix);
      var worldMatrix = m4.translate(matrix, 0, 0, object.radius, matrix);

      // Multiply the matrices.
      m4.multiply(viewProjectionMatrix, worldMatrix, uniformsThatAreComputedForEachObject.u_worldViewProjection);
      m4.transpose(m4.inverse(worldMatrix), uniformsThatAreComputedForEachObject.u_worldInverseTranspose);

      // Set the uniforms we just computed
      webglUtils.setUniforms(programInfo, uniformsThatAreComputedForEachObject);

      // Set the uniforms that are specific to the this object.
      webglUtils.setUniforms(programInfo, object.materialUniforms);

      // Draw the geometry.
      gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    });

    requestAnimationFrame(drawScene);
  }
}

// Check if we're running in jQuery
if (window.$) {
  window.$(function(){
    main();
  });
} else {
  window.addEventListener('load', main);
}

