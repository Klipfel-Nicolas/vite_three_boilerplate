import * as THREE from 'three';
import Experience from "../Experience";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

export default class Camera {
    
    constructor(smoothZoom=false) {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.debug = this.experience.debug;
        this.smoothZoom = smoothZoom;

        this.createPerspectiveCamera(-5, 5, -9) 
        
        this.setOrbitControls(this.canvas, !this.smoothZoom);
    
        if(this.smoothZoom) this.setTrackballControls(this.canvas)

        this.createGridHelper(50, 50, 'floorGrid', 0xffffff, 'grey', 6 )

    }

    /**
     * Set Perspective Camera
     * @param {Number} positionX 
     * @param {Number} positionY 
     * @param {Number} positionZ 
     */
    createPerspectiveCamera(positionX, positionY, positionZ, index=1) {
        this.perspectiveCamera = new THREE.PerspectiveCamera(75, this.sizes.aspect, 0.1, 100000)
        this.perspectiveCamera.position.set(positionX, positionY, positionZ)
        this.scene.add(this.perspectiveCamera)

        //Debug
        if(this.debug.active) {
            this.debugPerspectiveCamera = this.debug.debugFolderCamera.addFolder(`perspective ${index}`)
            this.debugPositionPerspectiveCamera = this.debugPerspectiveCamera.addFolder('position')

            this.debugPositionPerspectiveCamera.add(this.perspectiveCamera.position, 'x').min(- 20).max(20).step(.1).name('camera-X')
            this.debugPositionPerspectiveCamera.add(this.perspectiveCamera.position, 'y').min(- 20).max(20).step(.1).name('camera-Y')
            this.debugPositionPerspectiveCamera.add(this.perspectiveCamera.position, 'z').min(- 20).max(20).step(.1).name('camera-Z')
        }        
    }

    /**
     * Create Orthograpique Camera Function
     * @param {Number} positionX 
     * @param {Number} positionY 
     * @param {Number} positionZ 
     */
    createOrthographicCamera(positionX, positionY, positionZ) {
        this.orthographicCamera = new THREE.OrthographicCamera(
            (-this.sizes.aspect * this.sizes.frustrum)/2,
            (this.sizes.aspect * this.sizes.frustrum)/2,
            this.sizes.frustrum/2,
            -this.sizes.frustrum/2,
            -50,
            50
        );

        this.orthographicCamera.position.y = positionY;
        this.orthographicCamera.position.z = positionZ;
        this.orthographicCamera.position.x = positionX;


        this.scene.add(this.orthographicCamera);

        //Debug
        if(this.debug.active) {
            this.debugOrtographicCamera = this.debug.debugFolderCamera.addFolder('ortographic')

            this.debugOrtographicCamera.add(this.orthographicCamera.position, 'x').min(- 25).max(50).step(1).name('camera-X')
            this.debugOrtographicCamera.add(this.orthographicCamera.position, 'y').min(- 25).max(50).step(1).name('camera-Y')
            this.debugOrtographicCamera.add(this.orthographicCamera.position, 'z').min(- 25).max(50).step(1).name('camera-Z')
        }

        // Helper
        /* this.helper = new THREE.CameraHelper( this.orthographicCamera );
        this.scene.add(this.helper) */

    }

    /**
     * 
     * @param {object} renderer 
     * @param {boolean} enableDamping
     */
    setOrbitControls(renderer, enableZoom = true, enableControl = true,  enableDamping = true )
    {
        console.log('enableZoom', enableZoom)
        this.controls = new OrbitControls(this.perspectiveCamera, renderer);
        this.controls.enabled = enableControl;
        this.controls.enableDamping = enableDamping;
        this.controls.enableZoom = enableZoom;
    }

    /**
     * 
     * @param {object} renderer 
     */
    setTrackballControls(renderer) {
        this.trControls = new TrackballControls(this.perspectiveCamera, renderer);
        this.trControls.noRotate = true;
        this.trControls.noPan = true;
        this.trControls.noZoom = false;
        this.trControls.zoomSpeed = 1.5;
    }

    /**
     * 
     * @param {number} minDistance 
     * @param {number} maxDistance 
     * @param {number} zoomSpeed 
     * @param {number} maxPolarAngle 
     */
    orbitControlsSettings(minDistance, maxDistance, zoomSpeed, maxPolarAngle)
    {
        this.controls.minDistance = minDistance;
        this.controls.maxDistance = maxDistance; 
        
        if(zoomSpeed) this.controls.zoomSpeed = zoomSpeed;
        if (maxPolarAngle) this.controls.maxPolarAngle = maxPolarAngle;

    }

    // RESIZE 
    resize() {
        this.perspectiveCamera.aspect = this.sizes.width / this.sizes.height
        this.perspectiveCamera.updateProjectionMatrix()
    }

    //GRID HELPER
    /**
     * 
     * @param {number} size 
     * @param {number} divisions 
     * @param {string} debugName  
     * @param {0xffffff} colorLinesCenter 
     * @param {string} colorLinesGrid 
     * @param {number} linewidth 
     * @param {number} axesHelper 
     */
    createGridHelper(
        size, 
        divisions,
        debugName,
        colorLinesCenter = 0xffffff, 
        colorLinesGrid = '', 
        linewidth = 1,
        axesHelper = 5
    ) {
        const colorLinesGridThree = new THREE.Color(colorLinesGrid);

        const gridHelper = new THREE.GridHelper( size, divisions, colorLinesCenter, colorLinesGridThree );
        gridHelper.material.linewidth = linewidth;
        gridHelper.position.y = .1;
        this.scene.add( gridHelper );

        const axesHelperThree = new THREE.AxesHelper( axesHelper );
        axesHelperThree.position.y = .2;
        this.scene.add( axesHelperThree );

        gridHelper.visible = axesHelperThree.visible = false
        
        //DEBUG
        if(this.debug.active) {
            this.gridDebug = this.debug.debugFolderHelper.addFolder(`${debugName}`);

            this.gridDebug.add(gridHelper, 'visible').name('grid');
            this.gridDebug.add(axesHelperThree, 'visible').name('axes');
        }
    }

    //UPDATE
    update() {


        if(this.controls) {
            const target = this.controls.target;
            this.controls.update();  

            //Smooth zoom
            if(this.trControls) {
                this.trControls.target.set(target.x, target.y, target.z);
                this.trControls.update()
            } 
        }
        
        /* this.helper.matrixWorldNeedsUpdate = true;
        this.helper.update()
        this.helper.position.copy(this.orthographicCamera.position)
        this.helper.rotation.copy(this.orthographicCamera.rotation) */
    }
}