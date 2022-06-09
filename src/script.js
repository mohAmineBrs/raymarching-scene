import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import * as dat from 'dat.gui'
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
 const textureLoader = new THREE.TextureLoader()
 const matcapTexture = textureLoader.load('/textures/matcaps/15.png')

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Object
 */
var geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);


var material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  side: THREE.DoubleSide,
  uniforms: {
      uTime: {value: 0},
      uMatcap: {value: matcapTexture},
      uResolution: {value: new THREE.Vector4()},
      uMouse: {value: new THREE.Vector2(0, 0)},
      uMouseSphere: {value: 0.2},
      uFirstProgress: {value: 0},
      uSecondProgress: {value: 0},
      uThirdProgress: {value: 0},
      uCamZPos: {value: 2}

    }
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/**
 * Media Query
 */
 const smallMediaQuery = window.matchMedia('only screen and (max-width: 600px)');


 if (smallMediaQuery.matches) {
    material.uniforms.uCamZPos.value = 4

 }


 if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    material.uniforms.uMouseSphere.value = 0

  } else{
    material.uniforms.uMouseSphere.value = 0.2

  }

  window.addEventListener('load', function () {
    window.scrollTo(0, 0);
  })


/**
 * Raycaster
 */
 const raycaster = new THREE.Raycaster()
 



window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight


    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // Update uResolution
    // material.uniforms.uResolution.value = new THREE.Vector4(sizes.width, sizes.height, a1, a2)


})

// Image cover
const imageAspect = 1
let a1; let a2

if (sizes.height / sizes.width > imageAspect) {
    a1 = (sizes.width / sizes.height) * imageAspect
    a2 = 1
} else {
    a1 = 1
    a2 = (sizes.width / sizes.height) * imageAspect
}
material.uniforms.uResolution.value = new THREE.Vector4(sizes.width, sizes.height, a1, a2)



/**
 * Mouse Move Event
 */
 const mouse = new THREE.Vector2()
 window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / sizes.width) - 0.5
    mouse.y = - (e.clientY / sizes.height) + 0.5

})


/**
 * Mouse Wheel Event
 */
 const lerp = (x, y, a) => x * (1 - a) + y * a;
 const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
 const invlerp = (x, y, a) => clamp((a - x) / (y - x));
 const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));
 const myUl = document.querySelector('.htmlContent .myList ul')
 window.addEventListener("scroll", (e) => {
    material.uniforms.uFirstProgress.value = invlerp(300, 1000, window.scrollY)
    material.uniforms.uSecondProgress.value = invlerp(1400, 2000, window.scrollY)
    material.uniforms.uThirdProgress.value = invlerp(2400, 3000, window.scrollY)
    // myUl.style.top = `${range(400, 3200, 0, -510, window.scrollY)}px`
    gsap.to(myUl, {
        top: `${range(400, 3200, 0, -510, window.scrollY)}px`,
        duration: 0.4,
        ease: "power2.out"
    })

    // Remove scroll down spinner after 300 px height
    if(window.scrollY>300) {
        gsap.to('.scrollDown', {
            opacity: 0,
            duration: 0.6,
        })
    } else {
        gsap.to('.scrollDown', {
            opacity: 1,
            duration: 0.6,
        })
    }
}, false)


/**
 * Camera
 */
// Base camera
const frustumSize = 1
const camera = new THREE.OrthographicCamera(frustumSize / -2, frustumSize / 2, frustumSize / 2, frustumSize / -2, -1000, 1000)
camera.position.set(0, 0, 2)
scene.add(camera)


// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xffffff)


/**
 * Animate
 */
 const clock = new THREE.Clock()
 let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Upadte uTime Uniform
    material.uniforms.uTime.value = elapsedTime

    // Upadte uMouse Uniform
    material.uniforms.uMouse.value = mouse


    
    // // Cast a Ray
    // raycaster.setFromCamera(mouse, camera)
    
    // const intersects = raycaster.intersectObject(mesh)

    //     // mesh.scale.set(1)
    //     // intersects.mesh.scale.set(3)

    // if (intersects.length) {
    //     if (currentIntersect === null) {
    //         console.log("Mouse enter")
    //     }

    //     currentIntersect = intersects[0]
    // } else {
    //     if (currentIntersect) {
    //         console.log("Mouse leave")
    //     }

    //     currentIntersect = null
    // }

    // Update controls
    // controls.update()
    console.log(mesh.scale.x)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()