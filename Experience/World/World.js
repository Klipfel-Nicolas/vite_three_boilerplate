import * as THREE from 'three'
import Experience from '../Experience';
import { EventEmitter } from "events";

import Environment from '../Scene/Environement';
import Models from './Models';
import Objects from './Objects';


export default class World extends EventEmitter {
    constructor() {
        super();

        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.camera = this.experience.camera;
        this.resources = this.experience.resources;
        
        // Start world (on ressource ready)
        this.resources.on("ready", ()=> {
            this.environment = new Environment();

            // Floor
            this.setFloor(50, 50, 0xffffff) 

            // Wolf
            this.wolf = new Models(this.resources.items.wolf.scene);
            this.wolf.model.scale.set(.005, .005, .005);
            this.wolf.model.position.y = -7.3;

            // Sphere Object
            this.sphere = new Objects(
                new THREE.IcosahedronGeometry(1, 10),
                new THREE.MeshStandardMaterial({
                    color: 0xff0000
                }),
                'sphere'
            );
            this.sphere.object.position.set(5, 2, 0)


            // Cube Object
            this.cube = new Objects(
                new THREE.BoxGeometry( 1.5, 1.5, 1.5 ),
                new THREE.MeshBasicMaterial( {
                    color: 0x00ff00, 
                    wireframe: false 
                }),
                'cube'
            );
            this.cube.object.position.set(-5, 2, 0)
            this.cube.object.rotation.set(1, 1, 1)
            
            
            
     
            this.emit("worldready");
        }); 
        
    }

    /**
     * 
     * @param {number} geometryX 
     * @param {number} geometryZ 
     * @param {*} color 
     */
    setFloor(geometryX, geometryZ, color) {
        const geometry = new THREE.PlaneGeometry(geometryX, geometryZ);
        const material = new THREE.MeshStandardMaterial( {color: color, side: THREE.DoubleSide} );
        this.plane = new THREE.Mesh( geometry, material );
        this.plane.receiveShadow = true;
        this.plane.castShadow = false;
    
        this.plane.rotateX(Math.PI / 180 * 90);
        this.scene.add( this.plane );
    }

    //RESIZE
    resize() {
    }

    //UPDATE
    update() {
        
        if(this.cube) {
            this.cube.object.rotation.x -= .001 * 2;
            this.cube.object.rotation.y -= .001 * 3;
            this.cube.object.rotation.z -= .001 * 4;
        }
    }
}