# Single file with material
  python keyshot_convert.py model.prt output.glb --material "Stainless Steel Brushed Fine 90°"

  # Batch convert with material
  python keyshot_convert.py --batch ./creo_files ./gltf_output --material "Steel"

  # With quality settings
  python keyshot_convert.py model.prt output.glb --material "Stainless Steel Brushed Fine 90°" --dpi 300
  --samples 64