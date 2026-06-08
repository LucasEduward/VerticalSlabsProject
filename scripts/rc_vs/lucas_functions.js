const oppositeFaces = {
    north: "south",
    south: "north",
    west: "east",
    east: "west"
}

export function getOppositeFace(block, blockface){
    const visibleHalf = block.permutation.getState("vs:half")
    const cardinalDirection = blockface.toLowerCase()

    if (visibleHalf == "front") {
        return oppositeFaces[cardinalDirection]
    } else {
        return cardinalDirection
    }
}

export function getCardinalDir(target) {
    
    let yaw = target.getRotation().y;
    
    if ( yaw < -45 && yaw >= -135) return "east";
    if (yaw > -45 && yaw < 45) return "south";
    if (yaw < 135 && yaw >= 45) return "west";
    return "north";
    
    
    
}

export function fixInvertedValue(facecoords, facedir, blockloc, cardDirection) {
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