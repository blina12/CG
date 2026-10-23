import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 8, 14);

// Dritat
const pointLight = new THREE.PointLight(0xffffff, 200);   // vjen nga Dielli
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(pointLight, ambientLight);

// Dielli
const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
);
scene.add(sunMesh);

function createPlanet(size, distance, color) {
    const orbit = new THREE.Object3D();
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 32),
        new THREE.MeshStandardMaterial({ color: color, wireframe: true })
    );
    mesh.position.x = distance;
    orbit.add(mesh);
    scene.add(orbit);
    return { orbit, mesh };
}

const mercury = createPlanet(0.2, 2,   0xaaaaaa);
const venus   = createPlanet(0.4, 3.2, 0xe8b86d);
const earth   = createPlanet(0.5, 4.5, 0x3366ff);
const mars    = createPlanet(0.3, 6,   0xd1523a);

// Hëna: i shtohet Tokës, kështu rrotullohet rreth saj
const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
);
moonMesh.position.x = 0.8;
earth.mesh.add(moonMesh);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    sunMesh.rotation.y += 0.01;

    // rrotullimi rreth Diellit 
    mercury.orbit.rotation.y += 0.04;
    venus.orbit.rotation.y   += 0.03;
    earth.orbit.rotation.y   += 0.02;
    mars.orbit.rotation.y    += 0.015;

    // rrotullimi rreth vetes
    mercury.mesh.rotation.y += 0.02;
    venus.mesh.rotation.y   += 0.02;
    earth.mesh.rotation.y   += 0.03;   // kjo e rrotullon edhe Henen rreth Tokes
    mars.mesh.rotation.y    += 0.02;

    renderer.render(scene, camera);
}
animate();