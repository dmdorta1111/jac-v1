import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function Scene() {
  const gltf = useLoader(GLTFLoader, '/models/Model_test.gltf')
  return <primitive object={gltf.scene} />
}