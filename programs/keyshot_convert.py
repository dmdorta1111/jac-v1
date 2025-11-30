#!/usr/bin/env python3
"""
KeyShot Creo to glTF Converter Wrapper
This wrapper script helps run KeyShot in headless mode to convert Creo files to glTF

This is the main script you should run - it calls KeyShot with the conversion script.
"""

import subprocess
import sys
import os
from pathlib import Path
import argparse

def find_keyshot():
    """Try to find KeyShot executable"""
    common_paths = [
        'keyshot',
        'keyshot.exe',
        '/usr/local/bin/keyshot',
        'C:\\Program Files\\KeyShot\\bin\\keyshot.exe',
        'C:\\Program Files\\KeyShot11\\bin\\keyshot.exe',
        'C:\\Program Files\\KeyShot10\\bin\\keyshot.exe',
        'C:\\Program Files\\KeyShot 2024\\bin\\keyshot.exe',
        '/Applications/KeyShot.app/Contents/MacOS/KeyShot',
        '/Applications/KeyShot11.app/Contents/MacOS/KeyShot',
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
        try:
            result = subprocess.run([path, '-version'], 
                                  capture_output=True, 
                                  timeout=5)
            if result.returncode == 0:
                return path
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    
    return None

def run_keyshot_conversion(keyshot_path, script_path, args):
    """
    Run KeyShot in headless mode with the conversion script
    
    Args:
        keyshot_path: Path to KeyShot executable
        script_path: Path to the KeyShot Python script
        args: Additional arguments for the script
    """
    # Build the command
    # KeyShot headless mode: keyshot -script script.py arg1 arg2 ...
    cmd = [keyshot_path, '-script', script_path] + args
    
    print(f"Running KeyShot in headless mode...")
    print(f"Command: {' '.join(cmd)}")
    print()
    
    # Run the command
    try:
        result = subprocess.run(
            cmd,
            stdout=sys.stdout,
            stderr=sys.stderr,
            text=True
        )
        
        return result.returncode
    except Exception as e:
        print(f"Error running KeyShot: {e}")
        return 1

def main():
    parser = argparse.ArgumentParser(
        description='Convert Creo files to glTF using KeyShot (headless)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert single file
  python keyshot_convert.py model.prt output.glb

  # Convert with material applied to all geometry
  python keyshot_convert.py model.prt output.glb --material "Stainless Steel Brushed Fine 90°"

  # Convert with high quality settings
  python keyshot_convert.py model.prt output.glb --dpi 300 --samples 64

  # Batch convert directory with material
  python keyshot_convert.py --batch ./creo_files ./gltf_output --material "Steel"

  # Specify KeyShot path
  python keyshot_convert.py model.prt output.glb --keyshot /path/to/keyshot

  # Custom quality settings
  python keyshot_convert.py model.prt output.glb --dpi 200 --samples 48 --no-compression

Requirements:
  - KeyShot Pro (scripting requires Pro license)
  - KeyShot 10 or later (for glTF export)
        """
    )
    
    parser.add_argument('input', nargs='?', 
                       help='Input Creo file or directory (with --batch)')
    parser.add_argument('output', nargs='?',
                       help='Output glTF file or directory')
    parser.add_argument('--batch', action='store_true',
                       help='Batch convert all Creo files in input directory')
    parser.add_argument('--keyshot', 
                       help='Path to KeyShot executable')
    parser.add_argument('--script',
                       help='Path to KeyShot conversion script (default: creo_to_gltf_keyshot.py)')
    parser.add_argument('--dpi', type=int,
                       help='Texture resolution in DPI (default: 150)')
    parser.add_argument('--samples', type=int,
                       help='Number of baking samples (default: 32, higher = better quality)')
    parser.add_argument('--no-occlusion', action='store_true',
                       help='Disable ambient occlusion')
    parser.add_argument('--no-compression', action='store_true',
                       help='Disable Draco geometry compression')
    parser.add_argument('--material',
                       help='Material name to apply to all geometry before export (e.g., "Stainless Steel Brushed Fine 90°")')

    args = parser.parse_args()
    
    # Find KeyShot
    keyshot_path = args.keyshot or find_keyshot()
    
    if not keyshot_path:
        print("ERROR: Could not find KeyShot.")
        print("Please install KeyShot or specify the path with --keyshot")
        print()
        print("KeyShot can be downloaded from: https://www.keyshot.com/")
        print("Note: KeyShot Pro license is required for scripting features")
        sys.exit(1)
    
    print(f"Using KeyShot: {keyshot_path}")
    print()
    
    # Find the conversion script
    if args.script:
        script_path = args.script
    else:
        # Look for script in same directory as this wrapper
        script_dir = Path(__file__).parent
        script_path = script_dir / "creo_to_gltf_keyshot.py"
        
        if not script_path.exists():
            print(f"ERROR: Conversion script not found: {script_path}")
            print("Please ensure creo_to_gltf_keyshot.py is in the same directory")
            sys.exit(1)
    
    # Build arguments for the KeyShot script
    script_args = []
    
    if args.batch:
        if not args.input or not args.output:
            print("ERROR: --batch requires input and output directories")
            sys.exit(1)
        script_args.extend(['--batch', args.input, args.output])
    else:
        if not args.input or not args.output:
            print("ERROR: Input and output files are required")
            print("Use --help for usage information")
            sys.exit(1)
        script_args.extend([args.input, args.output])
    
    # Add optional arguments
    if args.material:
        script_args.extend(['--material', args.material])
    if args.dpi:
        script_args.extend(['--dpi', str(args.dpi)])
    if args.samples:
        script_args.extend(['--samples', str(args.samples)])
    if args.no_occlusion:
        script_args.append('--no-occlusion')
    if args.no_compression:
        script_args.append('--no-compression')
    
    # Run the conversion
    exit_code = run_keyshot_conversion(keyshot_path, str(script_path), script_args)
    
    if exit_code == 0:
        print()
        print("✓ Conversion completed successfully!")
    else:
        print()
        print("✗ Conversion failed")
    
    sys.exit(exit_code)

if __name__ == '__main__':
    main()
