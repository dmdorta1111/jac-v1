"use client";

import { forwardRef, useImperativeHandle, useCallback } from "react";
import { OrbitControls, Stage } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import Model_test from "./Model_test";

const Experience = forwardRef((props, ref) => {
  const { gl, scene, camera } = useThree();

  const captureScreenshot = useCallback(() => {
    // Force a render to ensure the latest frame is captured
    gl.render(scene, camera);
    
    // Get the canvas element and convert to data URL
    const dataUrl = gl.domElement.toDataURL('image/png');
    
    // Trigger download
    const link = document.createElement('a');
    link.download = `emjac-3d-model-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    return dataUrl;
  }, [gl, scene, camera]);

  // Expose capture function to parent via ref
  useImperativeHandle(ref, () => ({
    captureScreenshot
  }), [captureScreenshot]);

  return (
    <>
      <Stage 
        preset="rembrandt"
        intensity={30} 
        environment={"warehouse"}      
      >
        <Model_test/>
      </Stage>
      <OrbitControls
        makeDefault 
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
});

Experience.displayName = "Experience";

export default Experience;