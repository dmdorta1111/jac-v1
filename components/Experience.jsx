"use client";

import { OrbitControls, Stage } from "@react-three/drei";
import Model_test from "./Model_test";



const Experience = () => {

 //const { legs } = useConfigurator(); // Force rerender the stage & shadows
  

 return (
  <>
     <Stage 
      intensity={10.5} 
      environment={"park"} 
  
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