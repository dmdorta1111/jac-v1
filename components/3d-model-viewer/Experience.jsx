"use client";

import { OrbitControls, Stage } from "@react-three/drei";
import Model_test from "./Model_test";



const Experience = () => {

 return (
  <>
     <Stage 
      intensity={10.5} 
      environment={"studio"} 
  
      >
     <Model_test/>
      </Stage>
    <OrbitControls
      makeDefault 
      minPolarAngle={0}
      maxPolarAngle={Math.PI /2}
      />
    </>

 )
}

export default Experience;