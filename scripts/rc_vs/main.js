import * as mc from "@minecraft/server";

console.warn("vertical_slab.js carregado!");
// Global Variables

let slab_region = null
let faces = null
let blockId = null
//--

// Functions
function fixInvertedValue(facecoords, facedir, blockloc, cardDirection) {
    //--
    const xfaces = facedir == "North" || facedir == "South"
    const zfaces = facedir == "West" || facedir == "East"
    let xFixed = null
    let zFixed = null
    
    if (xfaces) {
        blockloc.x >= 0 ? xFixed = 1 - facecoords.x: xFixed = facecoords.x
    } else if (zfaces) {
        blockloc.z >= 0 ? zFixed = 1 - facecoords.z: zFixed = facecoords.z
    }else {
        
        if (cardDirection == "east" || cardDirection == "west") {
            if (blockloc.x >= 0) {xFixed = 1 - facecoords.x} else{
                xFixed = facecoords.x
            }
        } else {
            if (blockloc.z >= 0) {zFixed = 1 - facecoords.z} else {
                zFixed = facecoords.z
            }
        }
        
    }
    
    return {x: xFixed, z: zFixed}
}

function getCardinalDir(target) {
    
    let yaw = target.getRotation().y;
    
    if ( yaw < -45 && yaw >= -135) return "east";
    if (yaw > -45 && yaw < 45) return "south";
    if (yaw < 135 && yaw >= 45) return "west";
    return "north";
    
    
    
}


//--


//Player interecting 
mc.world.beforeEvents.playerInteractWithBlock.subscribe(data => {
    
    // Variables
    let coords = data.faceLocation
    faces = data.blockFace
    let directionvalue = getCardinalDir(data.player)
    blockId = data.itemStack.typeId
    //--
    
    
    // Holding Vertical Slab check
    if (!data.itemStack) return;
    
    
    //Debug
    console.warn(JSON.stringify(coords))
    console.warn(JSON.stringify("§aBlock face: " + "§r" + faces))
    console.warn(JSON.stringify("§acardinal angle value: " + "§6" + getCardinalDir(data.player)))
    //--
    
    
    

    // Gets ID to execute the function on any type of vertical slab
    if (blockId.startsWith("vs:") && blockId.endsWith("_vertical_slab")) {
        
        // Variables
        let fixedCoords = fixInvertedValue(coords, faces, data.block.location,directionvalue)
        //--


        // Debug
        
        //--

        if (faces == "Up" || faces == "Down"){
            const direction = getCardinalDir(data.player)
            

            if (direction == "north" ) {
                slab_region = fixedCoords.z > 0.5 ? "front": "back";
            } else if (direction == "south") {
                slab_region = fixedCoords.z > 0.5 ? "back": "front";
            } else if (direction == "west") {
                slab_region = fixedCoords.x > 0.5 ? "back": "front";
            }else {
                slab_region = fixedCoords.x > 0.5? "front": "back";
            }
        } else {
            slab_region = null
        }
        //--
    }
    
    
    
})



// Block State Get and Permutations Set
mc.system.beforeEvents.startup.subscribe(event =>{
    event.blockComponentRegistry.registerCustomComponent("vs:slab_placement", {
        beforeOnPlayerPlace(event) {
            
           event.permutationToPlace = event.permutationToPlace.withState("vs:half",slab_region)
           console.warn(slab_region)

          

            
        },

        onPlace(event) {
            const block = event.block

            mc.system.run(() => {

                if (blockId.startsWith("vs:") && blockId.endsWith("_vertical_slab")) {
                    block.setPermutation(
                        block.permutation.withState("vs:is_double", true)
                    )
 
                }

            })

        }

           

        
    })
})

