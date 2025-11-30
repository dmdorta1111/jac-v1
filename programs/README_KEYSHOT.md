# KeyShot Creo to glTF Converter

## Overview

This solution uses **KeyShot's powerful scripting capabilities** to convert Creo `.prt` and `.asm` files directly to glTF/GLB format in **headless mode** (no GUI required).

### Why KeyShot?

- ✅ **Direct Creo Import**: Native support for Creo files (.prt, .asm)
- ✅ **No Manual Export**: No need to export to STEP first
- ✅ **High Quality**: Professional-grade conversion with material baking
- ✅ **Batch Processing**: Convert multiple files automatically
- ✅ **Headless Mode**: Run without GUI for automation

## Requirements

### Software
- **KeyShot Pro** (scripting is a Pro feature only)
- **KeyShot 10 or later** (for glTF export support)
- **Python 3.8+** (for the wrapper script)

### License Note
KeyShot scripting functionality requires a **KeyShot Pro license**. The standard KeyShot license does not include scripting features.

## Installation

1. **Install KeyShot Pro** from https://www.keyshot.com/
2. **Download the conversion scripts**:
   - `keyshot_convert.py` - Main wrapper script (run this one)
   - `creo_to_gltf_keyshot.py` - KeyShot Python script (called by wrapper)

## Usage

### Basic Conversion

```bash
# Convert a single Creo file
python keyshot_convert.py model.prt output.glb

# Convert with custom output name
python keyshot_convert.py assembly.asm my_assembly.glb
```

### Batch Conversion

```bash
# Convert all Creo files in a directory
python keyshot_convert.py --batch ./creo_parts ./gltf_output

# The script will find all .prt and .asm files automatically
```

### Apply Material to All Geometry

```bash
# Apply a specific material before conversion (bakes material into textures)
python keyshot_convert.py model.prt output.glb --material "Stainless Steel Brushed Fine 90°"

# Apply material with batch conversion
python keyshot_convert.py --batch ./creo_parts ./gltf_output --material "Steel"

# Combine with quality settings
python keyshot_convert.py model.prt output.glb \
  --material "Stainless Steel Brushed Fine 90°" \
  --dpi 300 \
  --samples 64
```

### Quality Settings

```bash
# High quality export (larger file, better textures)
python keyshot_convert.py model.prt output.glb --dpi 300 --samples 64

# Fast export (smaller file, lower quality)
python keyshot_convert.py model.prt output.glb --dpi 100 --samples 16

# Custom settings
python keyshot_convert.py model.prt output.glb \
  --dpi 200 \
  --samples 48 \
  --no-occlusion \
  --no-compression
```

### Specify KeyShot Path

If KeyShot is not in your PATH:

```bash
python keyshot_convert.py model.prt output.glb \
  --keyshot "C:\Program Files\KeyShot11\bin\keyshot.exe"

# macOS
python keyshot_convert.py model.prt output.glb \
  --keyshot /Applications/KeyShot11.app/Contents/MacOS/KeyShot
```

## Export Options

| Option | Default | Description |
|--------|---------|-------------|
| `--material NAME` | None | Material name to apply to all geometry before export |
| `--dpi N` | 150 | Texture resolution in DPI. Higher = better quality but larger files |
| `--samples N` | 32 | Number of samples for material baking. Higher = better quality but slower |
| `--no-occlusion` | Enabled | Disable ambient occlusion in exported textures |
| `--no-compression` | Enabled | Disable Draco geometry compression (larger files) |

### Material Examples
Common KeyShot material names:
- `"Stainless Steel Brushed Fine 90°"`
- `"Steel"`
- `"Aluminum Brushed"`
- `"Chrome"`
- `"Plastic Glossy"`
- `"Rubber"`

Note: Material names must match exactly as they appear in the KeyShot Material Library.

### DPI Guidelines
- **100-150 DPI**: Fast exports, suitable for previews
- **150-200 DPI**: Good balance of quality and file size
- **200-300 DPI**: High quality for final deliverables
- **300+ DPI**: Maximum quality, very large files

### Sample Guidelines
- **16-24 samples**: Fast, suitable for previews
- **32-48 samples**: Good quality for most uses
- **64-128 samples**: High quality for final renders
- **128+ samples**: Maximum quality, very slow

## File Format Details

### GLB vs glTF
The script automatically detects the format from the file extension:
- **`.glb`**: Binary format, single file (recommended)
- **`.gltf`**: Text format with separate texture files

Both formats are functionally identical; GLB is more compact and easier to share.

### Supported Creo Files
- `.prt` - Creo part files
- `.asm` - Creo assembly files
- `.prt.1`, `.prt.2`, etc. - Versioned part files
- `.asm.1`, `.asm.2`, etc. - Versioned assembly files

### glTF Export Features
KeyShot's glTF export includes:
- ✅ Geometry with accurate dimensions
- ✅ Baked PBR materials and textures
- ✅ Ambient occlusion (optional)
- ✅ Draco compression (optional)
- ✅ Single consolidated texture per part
- ⚠️ Limited material support (see below)

### Material Limitations
The following KeyShot materials are **not supported** in glTF export:
- Flat materials
- Thin Film materials
- Translucent materials
- Advanced materials
- Anisotropic materials
- Gem materials

These will be exported using their diffuse color only.

## Examples

### Example 1: Simple Conversion
```bash
python keyshot_convert.py bracket.prt bracket.glb
```

### Example 2: Assembly with High Quality
```bash
python keyshot_convert.py engine_assembly.asm engine.glb \
  --dpi 250 \
  --samples 64
```

### Example 3: Batch Convert for Web
```bash
# Fast exports optimized for web viewing
python keyshot_convert.py --batch ./parts ./web_models \
  --dpi 150 \
  --samples 24
```

### Example 4: Maximum Quality for AR
```bash
python keyshot_convert.py product.prt product_ar.glb \
  --dpi 300 \
  --samples 128
```

## Troubleshooting

### "Could not find KeyShot"
- Ensure KeyShot is installed
- Use `--keyshot` to specify the path manually
- Check that KeyShot is in your system PATH

### "Scripting requires KeyShot Pro"
- Scripting is only available in KeyShot Pro
- Standard KeyShot licenses do not include scripting
- Upgrade to KeyShot Pro to use these scripts

### "Import failed"
- Ensure the Creo file is valid and not corrupted
- Try opening the file in Creo first to verify
- Check that you have the appropriate Creo file format version

### "Export failed"
- Check available disk space
- Lower DPI/samples if memory is an issue
- Ensure output directory has write permissions

### Large File Sizes
- Reduce `--dpi` value (e.g., 150 instead of 300)
- Reduce `--samples` value
- Enable Draco compression (enabled by default)
- Simplify complex assemblies before export

### Slow Performance
- Reduce `--samples` value significantly
- Reduce `--dpi` value
- Use `--no-occlusion` to skip AO baking
- Consider breaking large assemblies into smaller parts

## Advanced Usage

### Running KeyShot Script Directly
You can also run the KeyShot script directly without the wrapper:

```bash
# Windows
"C:\Program Files\KeyShot11\bin\keyshot.exe" -script creo_to_gltf_keyshot.py model.prt output.glb

# macOS
/Applications/KeyShot11.app/Contents/MacOS/KeyShot -script creo_to_gltf_keyshot.py model.prt output.glb

# Linux
keyshot -script creo_to_gltf_keyshot.py model.prt output.glb
```

### Automation & CI/CD
These scripts are perfect for automation pipelines:

```bash
#!/bin/bash
# Example automation script

for file in /path/to/creo/*.prt; do
    filename=$(basename "$file" .prt)
    python keyshot_convert.py "$file" "/output/${filename}.glb" \
      --dpi 200 \
      --samples 32
done
```

## Performance Benchmarks

Approximate conversion times (varies by complexity):

| Model Complexity | DPI | Samples | Time |
|-----------------|-----|---------|------|
| Simple part | 150 | 32 | 1-2 min |
| Medium part | 200 | 48 | 3-5 min |
| Complex assembly | 250 | 64 | 10-20 min |
| Large assembly | 300 | 128 | 30-60 min |

## Comparison with Other Methods

| Method | Pros | Cons |
|--------|------|------|
| **KeyShot** (this solution) | ✅ Direct import<br>✅ High quality<br>✅ Material baking | ⚠️ Requires Pro license<br>⚠️ Commercial software |
| **STEP → FreeCAD** | ✅ Free<br>✅ Open source | ⚠️ Requires STEP export<br>⚠️ Lower quality |
| **Commercial converters** | ✅ Many formats | ⚠️ Expensive<br>⚠️ Per-conversion costs |

## Resources

- **KeyShot Manual**: https://manual.keyshot.com/
- **KeyShot Scripting Docs**: https://media.keyshot.com/scripting/
- **KeyShot Forum**: https://forum.keyshot.com/
- **KeyShot Support**: https://support.keyshot.com/

## License

These scripts are provided as-is for use with KeyShot Pro. KeyShot is a commercial product of Luxion ApS.

## Support

For issues with:
- **These scripts**: Check the troubleshooting section above
- **KeyShot software**: Contact Luxion support
- **Creo files**: Contact PTC support
