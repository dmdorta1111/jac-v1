To apply a material to both sides of a mesh in Keyshot, you will need to split the object into two separate parts or use the Mesh material's Planar or Box mapping settings to duplicate or mirror the texture. If the object is a single part, you must first use "Split Separate Objects" or "Split Separate Surfaces" to divide it before applying the material to individual surfaces, or use a Multi-Material to layer materials on a single part. 
Option 1: Split the mesh and apply materials individually
Split the object: Right-click the object in the Real-time View or Scene Tree and select Split Separate Surfaces or Split Separate Objects to divide the mesh.
Apply materials: Drag and drop the desired material from the library onto each of the separated parts. 
Option 2: Use the Mesh material's planar mapping
Add a Mesh material: In the Material Graph, find the Mesh node and add it to the graph, then connect it to your material.
Enable planar mapping: Select the Mesh node and check the Planar box in its properties.
Adjust texture: Enable "Planar" to see the texture on both sides of the model, with a mirrored version on the "backside". 
Option 3: Use a Multi-Material 
Convert to Multi-Material: Right-click an object in the Real-time View, select Convert to Multi-Material, and then add a new material to the list.
Add materials: Drag and drop a new material onto the object, then select it from the Scene Tree.
Apply to the second side: Right-click the part and use the "Split Separate Surfaces" to create two separate parts, then apply the new material to the desired part.
Alternatively, apply to the second side: Right-click the second part and use the same material from the Scene Tree.
Adjust properties: Change the color, roughness, or other material properties for each sub-material as needed. 


KeyShot does not have a direct command-line syntax for material baking within the primary rendering commands. Material baking is part of the export process for specific file formats (like GLB/glTF, USD, 3MF) and is primarily managed through the KeyShot scripting API (Python) for automation. 
Using KeyShot Scripting for Automation 
You can automate model conversion and material baking using Python scripts executed from the command line. This requires KeyShot Pro (or an equivalent license with scripting access). 
1. Command Line Syntax to Run a Script
The general command line syntax to run KeyShot in "headless" mode (without the GUI) and execute a Python script is:
bash
keyshot.exe -script <path_to_script.py> (optional script arguments)
Replace keyshot.exe with the actual path to your KeyShot executable.
The (optional script arguments) can be accessed within your Python script. 
2. Python Scripting for Baking
Material baking functionality is exposed through the KeyShot scripting API, specifically when using "Smart Export" with formats like glTF/GLB. 
The following is a conceptual Python script (bake_and_export.py) demonstrating how to load a scene, prepare for baking (implicitly handled by the smart export), and export the model. 
python
import lux

# Define file paths
input_ksp = "C:/path/to/your/scene.ksp"
output_glb = "C:/path/to/your/baked_model.glb"

# Load the KeyShot scene
# Note: KeyShot scripting documentation provides functions for scene manipulation, 
# but direct scene loading might be part of the 'lux' module or require the GUI
# Depending on your KeyShot version, the exact method might vary.
# Example from documentation: lux.openFile(input_ksp)

# In a full script, you would:
# 1. Ensure materials are assigned correctly (this is assumed done in the KSP file)
# 2. Access export options and enable baking settings

# Export the scene as GLB with baked textures (Smart Export functionality)
# The 'exportGLB1' function is an example, actual function names may vary by version.
# Refer to the official [KeyShot Scripting Documentation](
python
https://media.keyshot.com/scripting/headless_doc/11.2/lux.html
python
) for exact function names.

# A notional function call might look like this:
# lux.exportGLB1(output_glb, includeAO=True, textureResolutionDPI=300, embedTextures=True)
# This uses the parameters available in the export dialog via the GUI

print(f"Scene loaded and exported to {output_glb} with material baking applied.")
3. How to Execute
Save the Python code above (modified for your specific needs and KeyShot version) as a .py file (e.g., bake_and_export.py).
Run the script from your command line: 
bash
"C:\Program Files\KeyShot 11\bin\keyshot.exe" -script "C:\path\to\your\bake_and_export.py"
Key Considerations
KeyShot Pro: Scripting is a Pro feature.
Documentation: The exact functions for export options vary by KeyShot version. You must consult the specific version of the KeyShot Scripting Documentation for accurate function names and parameters.
Baking is an Export Option: Material baking is not an independent command but an option available when exporting to certain formats like glTF, 3MF, or USD. 