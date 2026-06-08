import * as mc from "@minecraft/server";
import { getOppositeFace, fixInvertedValue, getCardinalDir } from "./lucas_functions";
console.warn("vertical_slab.js carregado!");
// Global Variables

let slab_region = null
let faces = null
let blockId = {
    check: null,
    value: null,
    holding: null
}
//--

//Player interacting 
mc.world.beforeEvents.playerInteractWithBlock.subscribe(data => {
    
    // Variables
    let coords = data.faceLocation
    faces = data.blockFace
    let directionvalue = getCardinalDir(data.player)
    blockId.check = data.itemStack.typeId.startsWith("vs:") && data.itemStack.typeId.endsWith("_vertical_slab");
    blockId.value = data.block.typeId
    blockId.holding = data.itemStack.typeId
    let clickedblock = data.block
    //--
    
    
    // Holding Vertical Slab check
    if (!data.itemStack) return;
    
    
    //Debug
    console.warn(JSON.stringify(coords))
    //console.warn(JSON.stringify("§aBlock face: " + "§r" + faces))
    //console.warn(JSON.stringify("§acardinal angle value: " + "§6" + directionvalue))
    
    //--

    // Gets ID to execute the function on any type of vertical slab
    if (blockId.check) {
        
        // Variables
        let fixedCoords = fixInvertedValue(coords, faces, data.block.location,directionvalue)
        //--

        // Get fixed face coords an return string to assing block_state "vs:half" value
        if (faces == "Up" || faces == "Down"){
            
            

            if (directionvalue == "north" ) {
                slab_region = fixedCoords.z > 0.5 ? "back": "front";
            } else if (directionvalue == "south") {
                slab_region = fixedCoords.z > 0.5 ? "front": "back";
            } else if (directionvalue == "west") {
                slab_region = fixedCoords.x > 0.5 ? "back": "front";
            }else {
                slab_region = fixedCoords.x > 0.5? "front": "back";
            }

            
            
            //--
        } else {
            slab_region = "back"

            //Do doble slab if the slab is interacted with another slab
            if (blockId.check && blockId.value == blockId.holding) {
               const clickedFace = faces.toLowerCase()
               const expectedFace = getOppositeFace(clickedblock, faces)
               
                mc.system.run(() => {
                    if (expectedFace == clickedFace){
    
                        data.cancel = true
                        data.block.setPermutation(data.block.permutation.withState("vs:half", "double"))
                    
                        console.warn("expected face: " +"§1" + expectedFace +"§r" + " clicked face: " + "§1" + clickedFace)
    
                    } else {return}
                })
        }
        //--
        
            
        } 
      
    }
    
    
    
})



// Block State Get and Permutations Set
mc.system.beforeEvents.startup.subscribe(event =>{
    event.blockComponentRegistry.registerCustomComponent("vs:slab_placement", {
        beforeOnPlayerPlace(event) {
            
            if(slab_region != null) {
                event.permutationToPlace = event.permutationToPlace.withState("vs:half",slab_region)
                console.warn(slab_region)
            } else {
                slab_region = null
            }
                console.warn(JSON.stringify(event.permutationToPlace.getState("minecraft:cardinal_direction")))
            slab_region = null
            
        }
           

        
    })
})

