"""
KeyShot Creo to glTF Converter Script
This script runs inside KeyShot's Python environment to convert Creo files to glTF/GLB

This script should be run with KeyShot headless mode:
keyshot -script creo_to_gltf_keyshot.py <input_file> <output_file> [options]

Requirements:
- KeyShot Pro (scripting is a Pro feature)
- KeyShot 10 or later (for glTF export support)
"""

import lux
import sys
import os
from pathlib import Path

def convert_creo_to_gltf(input_file, output_file, export_options=None):
    """
    Convert a Creo file to glTF using KeyShot
    
    Args:
        input_file: Path to Creo .prt or .asm file
        output_file: Path to output .glb or .gltf file
        export_options: Dictionary of export options
    """
    input_path = str(Path(input_file).resolve())
    output_path = str(Path(output_file).resolve())
    
    print(f"KeyShot Creo to glTF Converter")
    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print()
    
    # Check if input file exists
    if not os.path.exists(input_path):
        print(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)
    
    # Import the Creo file
    print("Importing Creo file into KeyShot...")
    try:
        import_opts = lux.getImportOptions()
        import_opts["snap_to_ground"] = True
        import_opts["adjust_environment"] = True
        import_opts["adjust_camera_look_at"] = True
        
        lux.importFile(input_path, opts=import_opts)
        print("✓ Import successful")
    except Exception as e:
        print(f"✗ Import failed: {e}")
        sys.exit(1)
    
    # Set default export options
    default_export_options = {
        "mode": lux.EXPORT_BAKING,
        "dpi": 150,  # Texture resolution (adjust for quality vs file size)
        "num_samples": 32,  # Number of samples for baking (higher = better quality)
        "occlusion": True,  # Include ambient occlusion
        "draco_compression": True,  # Compress geometry (smaller file size)
        "preferred_output": lux.EXPORT_OUTPUT_TEXTURES
    }
    
    # Merge with user-provided options
    if export_options:
        default_export_options.update(export_options)
    
    # Determine export format (GLB vs glTF)
    export_format = lux.EXPORT_GLTF
    
    # Export to glTF
    print("Exporting to glTF format...")
    print(f"  DPI: {default_export_options['dpi']}")
    print(f"  Samples: {default_export_options['num_samples']}")
    print(f"  Ambient Occlusion: {default_export_options['occlusion']}")
    print(f"  Draco Compression: {default_export_options['draco_compression']}")
    print()
    
    try:
        lux.exportFile(output_path, format=export_format, mode=default_export_options)
        print(f"✓ Export successful: {output_path}")
        return True
    except Exception as e:
        print(f"✗ Export failed: {e}")
        return False

def batch_convert(input_dir, output_dir, export_options=None):
    """
    Batch convert all Creo files in a directory
    
    Args:
        input_dir: Directory containing Creo files
        output_dir: Output directory for glTF files
        export_options: Dictionary of export options
    """
    input_path = Path(input_dir).resolve()
    output_path = Path(output_dir).resolve()
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Find all Creo files (.prt and .asm)
    creo_files = list(input_path.glob("*.prt")) + list(input_path.glob("*.asm"))
    
    # Also look for numbered versions (e.g., .prt.1, .asm.2)
    for i in range(1, 100):
        creo_files.extend(input_path.glob(f"*.prt.{i}"))
        creo_files.extend(input_path.glob(f"*.asm.{i}"))
    
    if not creo_files:
        print(f"No Creo files found in {input_dir}")
        return
    
    print(f"Found {len(creo_files)} Creo files")
    print()
    
    success_count = 0
    failed_count = 0
    
    for creo_file in creo_files:
        # Determine output filename
        output_file = output_path / f"{creo_file.stem}.glb"
        
        print(f"Converting: {creo_file.name}")
        
        try:
            if convert_creo_to_gltf(str(creo_file), str(output_file), export_options):
                success_count += 1
            else:
                failed_count += 1
        except Exception as e:
            print(f"✗ Error: {e}")
            failed_count += 1
        
        print()
    
    print(f"Batch conversion complete:")
    print(f"  Successful: {success_count}")
    print(f"  Failed: {failed_count}")

def main():
    """Main entry point for the script"""
    
    # Parse command line arguments
    if len(sys.argv) < 3:
        print("Usage:")
        print("  Single file: <input.prt> <output.glb> [--dpi N] [--samples N]")
        print("  Batch:       --batch <input_dir> <output_dir> [--dpi N] [--samples N]")
        print()
        print("Options:")
        print("  --dpi N          Texture resolution (default: 150)")
        print("  --samples N      Baking samples for quality (default: 32)")
        print("  --no-occlusion   Disable ambient occlusion")
        print("  --no-compression Disable Draco compression")
        print()
        print("Examples:")
        print("  Single:  mypart.prt output.glb")
        print("  Batch:   --batch ./creo_files ./gltf_output")
        print("  Quality: mypart.prt output.glb --dpi 300 --samples 64")
        sys.exit(1)
    
    # Parse arguments
    args = sys.argv[1:]
    batch_mode = False
    
    # Check for batch mode
    if args[0] == "--batch":
        batch_mode = True
        input_path = args[1]
        output_path = args[2]
        args = args[3:]
    else:
        input_file = args[0]
        output_file = args[1]
        args = args[2:]
    
    # Parse export options
    export_options = {}
    i = 0
    while i < len(args):
        if args[i] == "--dpi" and i + 1 < len(args):
            export_options["dpi"] = int(args[i + 1])
            i += 2
        elif args[i] == "--samples" and i + 1 < len(args):
            export_options["num_samples"] = int(args[i + 1])
            i += 2
        elif args[i] == "--no-occlusion":
            export_options["occlusion"] = False
            i += 1
        elif args[i] == "--no-compression":
            export_options["draco_compression"] = False
            i += 1
        else:
            i += 1
    
    # Run conversion
    if batch_mode:
        batch_convert(input_path, output_path, export_options)
    else:
        if not convert_creo_to_gltf(input_file, output_file, export_options):
            sys.exit(1)

if __name__ == "__main__":
    main()
