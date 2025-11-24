"use client";

import { Canvas } from "@react-three/fiber";
import { Interface } from "@/components/3d-model-viewer/interface";
import Experience from "@/components/3d-model-viewer/Experience";
import { ConfiguratorProvider } from "@/components/3d-model-viewer/Configurator";

export default function ModelsPage() {
  return (
    <ConfiguratorProvider>
      <div className="Models">
        <Canvas gl={{ antialias: true }} shadows camera={{ position: [4, 0, 6], fov: 35 }}>
          <Experience />
        </Canvas>
        <Interface />
      </div>
    </ConfiguratorProvider>
  );
}
