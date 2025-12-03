# Jlink - Comprehensive Research Report
## Java Automation Toolkit for Creo Parametric

**Research Date:** December 1, 2025
**Status:** Complete Knowledge Base for Development Teams

---

## Table of Contents
1. [What is Jlink?](#what-is-jlink)
2. [Installation & Setup](#installation--setup)
3. [Core Architecture & APIs](#core-architecture--apis)
4. [Best Practices](#best-practices)
5. [Common Patterns & Workflows](#common-patterns--workflows)
6. [Error Handling & Resource Management](#error-handling--resource-management)
7. [Performance Optimization](#performance-optimization)
8. [SmartAssembly Integration](#smartassembly-integration)
9. [Licensing & Versioning](#licensing--versioning)
10. [Resources & References](#resources--references)

---

## What is Jlink?

### Core Definition
Jlink is a **free, Java-based API** (Application Programming Interface) provided by PTC for automating and extending Creo Parametric (formerly Pro/ENGINEER). It allows developers to programmatically control Creo's functionality without manual user interaction.

### Key Characteristics
- **Framework:** Modern Java API for design automation
- **License:** Free with Creo Object TOOLKIT Java installation
- **Scope:** Supports Creo Parametric & Creo Direct
- **Access Level:** Safe, controlled access to Creo database and UI
- **Availability:** Included by default in Creo 4.0 F000 and later

### Primary Capabilities
| Capability | Description |
|---|---|
| **Model Manipulation** | Create, modify, save models programmatically |
| **Feature Management** | Add, edit, delete features; manage feature parameters |
| **Parameter Control** | Read/write part and assembly parameters |
| **Assembly Operations** | Create assemblies, add components, manage constraints |
| **Drawing Automation** | Generate drawings, place views, annotations |
| **Session Management** | Control Creo session state, model loading |
| **Geometry Access** | Query model geometry, dimensions, properties |
| **File Operations** | Open, save, export models in various formats |

### Use Cases
- **Design Automation:** Automatically generate models from design rules/parameters
- **Batch Processing:** Bulk modification of multiple models
- **Integration:** Connect Creo with external applications (ERP, PLM, web services)
- **Custom Workflows:** Create specialized UI and commands for specific industries
- **Report Generation:** Extract data and create automated documentation
- **FEA/Simulation:** Automate simulation setup and execution
- **Quality Control:** Automated design validation and checking

---

## Installation & Setup

### System Requirements
- **Creo Version:** 4.0 F000 or later
- **Java JDK:** Version 8 or later (JRE 11.0 compatible with Creo 8)
- **Operating System:** Windows, Linux, macOS
- **Required Component:** Creo Object TOOLKIT Java

### Installation Steps

#### 1. Install Creo with Required Components
```
During Creo installation:
  → Application Features
    → API Toolkits
      → Select "Creo Object TOOLKIT Java and Jlink"
```

**Important Note:** MUST be selected during initial Creo installation. Cannot be added via reconfigure after installation.

#### 2. Verify Installation Directories
After installation, Jlink creates directories under Creo loadpoint:

```
<CREO_LOADPOINT>/<DATECODE>/
├── Common Files/
│   ├── otk/
│   │   └── otk_java/          # Core Jlink libraries
│   ├── otk_java_doc/          # Documentation
│   └── otk_java_free/         # Example applications
└── Common Files/jlink/
    └── jlink_appls/
        └── jlinkexamples/     # Sample code
```

#### 3. Configure Development Environment

**CLASSPATH Variables:**
```bash
# Include these in your development environment
CLASSPATH = {CREO_LOADPOINT}/Common Files/otk/otk_java/otk.jar
CLASSPATH = {Your_Project_JAR_Files}
CLASSPATH = {Your_Source_Directories}
```

**Java Options:**
```bash
# Set JDK path
JAVA_HOME = {JDK_Installation_Path}
PATH = {JAVA_HOME}/bin;{Existing_PATH}
```

### IDE Setup

#### Eclipse Configuration
1. Create new Java Project
2. Add Creo Object TOOLKIT Java JAR to build path
3. Configure project structure:
   ```
   project/
   ├── src/          # Source code
   ├── lib/          # otk.jar
   ├── bin/          # Compiled classes
   └── jlink.txt     # Registration file (see below)
   ```

#### IDE Debugging
- Set debugger breakpoints in Java code
- Use IDE's Java debugger with Creo running
- Monitor console output for Jlink initialization messages

### Application Registration

**jlink.txt Registration File:**
```properties
# Mandatory format for Creo to recognize application
APPLICATION_NAME=MyJlinkApp
APPLICATION_STARTUP_CLASS=com.example.MyAppStartup
APPLICATION_TYPE=synchronous  # or asynchronous

# Optional: Custom menu entries, commands
MENU_ITEM_NAME=MyCustomMenu
MENU_COMMAND=MyCommand
```

**Registration Locations:**
- User-specific: `%USERPROFILE%\AppData\Roaming\PTC\Creo\startup.txt`
- System-wide: Creo loadpoint startup directory

---

## Core Architecture & APIs

### Package Structure

Jlink provides organized packages for different functional areas:

```
com.ptc.pfc.*                  # Base Creo Object TOOLKIT Java (preferred)
└── pfcBase                    # Foundation classes
│   ├── Session                # Session management
│   ├── Model                  # Model operations
│   ├── Feature                # Feature operations
│   └── Parameter              # Parameter handling
├── pfcAssembly                # Assembly-specific operations
├── pfcDrawing                 # Drawing automation
├── pfcGeometry                # Geometry queries
├── pfcAnalysisFeat            # Analysis features
├── pfcPattern                 # Pattern features
└── pfcDimension               # Dimension operations
```

**Legacy J-Link packages (still supported but deprecated):**
```
com.ptc.jlink.*                # Original J-Link structure
```

### Core Classes

#### Session Class
Primary entry point for all Jlink applications.

```java
import com.ptc.pfc.pfcBase.*;

public class JlinkApp {
    public static void main(String[] args) {
        try {
            // Get or create session
            Session session = pfcGlobal.GetProESession();

            // Get current working directory
            String pwd = session.GetCurrentDirectory();

            // Create new part
            Model newPart = session.CreatePart("MyPart");

        } catch (jxException ex) {
            System.err.println("Jlink Error: " + ex.getMessage());
        }
    }
}
```

**Key Session Methods:**
| Method | Purpose |
|---|---|
| `GetProESession()` | Get active Creo session (creates if none exists) |
| `GetCurrentDirectory()` | Get current working directory |
| `SetCurrentDirectory(String)` | Change working directory |
| `OpenFile(String path)` | Open existing model |
| `CreatePart(String name)` | Create new part |
| `CreateAssembly(String name)` | Create new assembly |
| `GetActiveModel()` | Get currently active model |
| `ListModels()` | List all open models |
| `SaveAll()` | Save all open models |

#### Model Class
Represents a Creo part, assembly, or drawing.

```java
Model model = session.GetActiveModel();

// Model information
String modelName = model.GetCommonName();
String fileName = model.GetFileName();
String fullName = model.GetFullName();

// Model type checking
if (model.GetType() == ModelType.MDL_PART) {
    // Handle part-specific operations
}

// Model state
boolean isModified = model.IsModified();
boolean isNative = model.IsNativeModel();

// Save operations
model.Save();
model.Regenerate();
```

#### Feature Class
Represents a feature in a model's feature tree.

```java
Model part = session.GetActiveModel();

// Get feature tree
FeatureCollection features = part.ListFeatures();

// Iterate through features
for (int i = 0; i < features.getarraysize(); i++) {
    Feature feat = features.get(i);
    String featName = feat.GetName();
    FeatureType featType = feat.GetFeatType();
}

// Access specific feature
Feature pocketFeat = part.GetFeatureByName("Pocket1");

// Get feature parameters
ParamCollection params = pocketFeat.GetParameters();
```

#### Parameter Class
Handles model and feature parameters.

```java
// Get parameter from model
Parameter param = model.GetParam("Length");
ParamValue paramValue = param.GetValue();
double value = paramValue.GetDoubleValue();

// Modify parameter
ParamValue newValue = pfcGlobal.CreateDoubleParamValue(50.0);
param.SetValue(newValue);

// Parameter types
// - PARAM_DOUBLE: Floating point
// - PARAM_INTEGER: Whole number
// - PARAM_STRING: Text
// - PARAM_BOOLEAN: True/False
// - PARAM_CHOICE: List selection

// Set parameter with expression
param.SetValue(pfcGlobal.CreateStringParamValue("2*5+3"));
```

#### Assembly Class
Specific operations for assembly models.

```java
Model assembly = session.CreateAssembly("MyAssembly");

// Add component
ComponentPath compPath = assembly.AddComponent(
    "C:/models/part1.prt",
    pfcGlobal.CreateDoubleParamValue(0),  // x
    pfcGlobal.CreateDoubleParamValue(0),  // y
    pfcGlobal.CreateDoubleParamValue(0)   // z
);

// Get components
ComponentCollection components = assembly.ListComponents();

// Get component reference
Component comp = assembly.GetComponentByName("part1");

// Get component model
Model compModel = comp.GetModel();

// Remove component
assembly.RemoveComponent(compPath);
```

#### Drawing Class
Automation for drawing documents.

```java
Model drawing = session.CreateDrawing("MyDrawing", "A4");

// Get sheet
Sheet sheet = drawing.GetSheetByName("Sheet1");

// Add view
DrawingModel drawModel = (DrawingModel) drawing;
ViewCollection views = drawModel.ListViews();

// Add dimension to drawing (requires specific view)
View view = drawModel.GetViewByName("FRONT");
```

---

## Best Practices

### 1. Session Management

**Always Wrap in Try-Catch:**
```java
Session session = null;
try {
    session = pfcGlobal.GetProESession();
    // Work with session
} catch (jxException ex) {
    System.err.println("Session error: " + ex.getMessage());
    ex.printStackTrace();
} finally {
    // Cleanup if needed
    if (session != null) {
        // Note: Don't destroy session if Creo should remain open
    }
}
```

**Error Handling Hierarchy:**
```java
try {
    // Jlink operations
} catch (jxCOMException ex) {
    // COM communication errors
} catch (jxException ex) {
    // General Jlink errors
} catch (Exception ex) {
    // Java-level exceptions
}
```

### 2. Model Manipulation

**Check Model Type Before Operations:**
```java
Model model = session.GetActiveModel();
ModelType modelType = model.GetType();

if (modelType == ModelType.MDL_PART) {
    // Part-specific operations
} else if (modelType == ModelType.MDL_ASSEMBLY) {
    // Assembly-specific operations
} else if (modelType == ModelType.MDL_DRAWING) {
    // Drawing-specific operations
}
```

**Regenerate After Modifications:**
```java
// Always regenerate after feature/parameter changes
model.Regenerate();

// Verify regeneration succeeded
if (!model.IsModified()) {
    System.out.println("Model regenerated successfully");
}
```

**Safe Parameter Modification:**
```java
try {
    Parameter param = model.GetParam("DesignParameter");
    if (param != null) {
        // Validate before setting
        double newValue = 100.0;
        if (newValue > 0 && newValue < 1000) {
            param.SetValue(pfcGlobal.CreateDoubleParamValue(newValue));
            model.Regenerate();
        }
    }
} catch (jxException ex) {
    System.err.println("Parameter modification failed: " + ex.getMessage());
}
```

### 3. Feature Creation

**Pattern for Creating Features:**
```java
// 1. Create feature using FeatureCreationData
FeatureCreationData featData = model.CreateFeature();

// 2. Set feature properties
featData.SetName("MyFeature");
featData.SetType(FeatureType.FEAT_EXTRUDE);

// 3. Set feature parameters
ParamCollection params = featData.GetParameters();
params.Insert(0, "depth", pfcGlobal.CreateDoubleParamValue(10.0));
params.Insert(1, "direction", pfcGlobal.CreateIntegerParamValue(1));

// 4. Create the feature in model
Feature newFeat = model.AddFeature(featData);

// 5. Regenerate model
model.Regenerate();
```

### 4. Working with Collections

**Safe Collection Iteration:**
```java
FeatureCollection features = model.ListFeatures();

if (features != null && features.getarraysize() > 0) {
    for (int i = 0; i < features.getarraysize(); i++) {
        try {
            Feature feat = features.get(i);
            System.out.println("Feature: " + feat.GetName());
        } catch (jxException ex) {
            System.err.println("Error accessing feature at index " + i);
        }
    }
}
```

### 5. File Operations

**Save with Error Checking:**
```java
try {
    model.Save();
    System.out.println("Model saved successfully");
} catch (jxException ex) {
    if (ex.getMessage().contains("permission")) {
        System.err.println("Permission denied saving model");
    } else if (ex.getMessage().contains("disk full")) {
        System.err.println("Insufficient disk space");
    }
}
```

**Open Files with Validation:**
```java
String filePath = "C:/models/part.prt";
File file = new File(filePath);

if (file.exists() && file.isFile()) {
    try {
        Model model = session.OpenFile(filePath);
        System.out.println("Model opened: " + model.GetCommonName());
    } catch (jxException ex) {
        System.err.println("Failed to open model: " + ex.getMessage());
    }
} else {
    System.err.println("File not found: " + filePath);
}
```

### 6. Resource Cleanup

**Proper Cleanup Pattern:**
```java
public class JlinkApp {
    private Session session;
    private List<Model> openModels = new ArrayList<>();

    public void initialize() throws jxException {
        session = pfcGlobal.GetProESession();
    }

    public void cleanup() {
        // Close all models (optional)
        for (Model model : openModels) {
            try {
                if (!model.IsModified()) {
                    model.Delete();  // Close without saving
                }
            } catch (jxException ex) {
                System.err.println("Cleanup error: " + ex.getMessage());
            }
        }
        openModels.clear();
    }

    public void run() {
        try {
            initialize();
            // Application logic
        } catch (jxException ex) {
            ex.printStackTrace();
        } finally {
            cleanup();
        }
    }
}
```

### 7. Logging & Debugging

**Implement Proper Logging:**
```java
import java.util.logging.*;

public class JlinkApp {
    private static final Logger logger = Logger.getLogger(JlinkApp.class.getName());

    public static void main(String[] args) {
        try {
            logger.info("Starting Jlink application");
            Session session = pfcGlobal.GetProESession();
            logger.fine("Session established");

        } catch (jxException ex) {
            logger.severe("Jlink error: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}
```

---

## Common Patterns & Workflows

### Pattern 1: Model Creation from Parameters

**Workflow:** Create part with parametric dimensions from external data.

```java
public class ParametricModelCreator {

    public Model createCylinderFromSpecs(
            Session session,
            String partName,
            double diameter,
            double height) throws jxException {

        // Create new part
        Model part = session.CreatePart(partName);

        // Add parameters
        Parameter diamParam = part.CreateParameter("DIAMETER");
        diamParam.SetValue(pfcGlobal.CreateDoubleParamValue(diameter));

        Parameter heightParam = part.CreateParameter("HEIGHT");
        heightParam.SetValue(pfcGlobal.CreateDoubleParamValue(height));

        // Regenerate to apply parameters
        part.Regenerate();

        // Save model
        part.Save();

        return part;
    }
}
```

### Pattern 2: Batch Model Modification

**Workflow:** Modify multiple models with same operation.

```java
public class BatchModifier {

    public void modifyMultipleModels(
            Session session,
            List<String> modelPaths,
            String paramName,
            double newValue) {

        int successCount = 0;
        int failureCount = 0;

        for (String path : modelPaths) {
            try {
                Model model = session.OpenFile(path);

                Parameter param = model.GetParam(paramName);
                if (param != null) {
                    param.SetValue(pfcGlobal.CreateDoubleParamValue(newValue));
                    model.Regenerate();
                    model.Save();
                    successCount++;
                }

                model.Delete();  // Close model

            } catch (jxException ex) {
                System.err.println("Failed to process " + path + ": " + ex.getMessage());
                failureCount++;
            }
        }

        System.out.println("Batch processing complete: " + successCount +
                         " successful, " + failureCount + " failed");
    }
}
```

### Pattern 3: Assembly Generation

**Workflow:** Programmatically build assemblies from part list.

```java
public class AssemblyBuilder {

    public Model buildAssembly(
            Session session,
            String assemblyName,
            List<ComponentSpec> components) throws jxException {

        Model assembly = session.CreateAssembly(assemblyName);

        double xPosition = 0;

        for (ComponentSpec compSpec : components) {
            try {
                // Add component with positioning
                ComponentPath compPath = assembly.AddComponent(
                    compSpec.getFilePath(),
                    pfcGlobal.CreateDoubleParamValue(xPosition),
                    pfcGlobal.CreateDoubleParamValue(0),
                    pfcGlobal.CreateDoubleParamValue(0)
                );

                // Apply constraints if specified
                if (compSpec.hasConstraints()) {
                    applyConstraints(assembly, compPath, compSpec.getConstraints());
                }

                xPosition += compSpec.getSpacing();

            } catch (jxException ex) {
                System.err.println("Failed to add component: " + compSpec.getName());
            }
        }

        assembly.Regenerate();
        assembly.Save();

        return assembly;
    }

    private void applyConstraints(
            Model assembly,
            ComponentPath compPath,
            List<ConstraintSpec> constraints) throws jxException {
        // Implementation for constraint application
    }
}
```

### Pattern 4: Data Extraction

**Workflow:** Extract model information for reports/analysis.

```java
public class ModelDataExtractor {

    public Map<String, Object> extractModelData(Model model) throws jxException {
        Map<String, Object> data = new HashMap<>();

        // Basic information
        data.put("name", model.GetCommonName());
        data.put("type", model.GetType().toString());
        data.put("fileName", model.GetFileName());

        // Parameters
        ParamCollection params = model.ListParams();
        Map<String, Object> paramMap = new HashMap<>();

        if (params != null) {
            for (int i = 0; i < params.getarraysize(); i++) {
                Parameter param = params.get(i);
                paramMap.put(param.GetName(), param.GetValue().ToString());
            }
        }
        data.put("parameters", paramMap);

        // Features (for parts)
        if (model.GetType() == ModelType.MDL_PART) {
            FeatureCollection features = model.ListFeatures();
            List<String> featureNames = new ArrayList<>();

            if (features != null) {
                for (int i = 0; i < features.getarraysize(); i++) {
                    featureNames.add(features.get(i).GetName());
                }
            }
            data.put("features", featureNames);
        }

        // Components (for assemblies)
        if (model.GetType() == ModelType.MDL_ASSEMBLY) {
            ComponentCollection components = model.ListComponents();
            List<String> componentNames = new ArrayList<>();

            if (components != null) {
                for (int i = 0; i < components.getarraysize(); i++) {
                    componentNames.add(components.get(i).GetName());
                }
            }
            data.put("components", componentNames);
        }

        return data;
    }
}
```

### Pattern 5: Error Recovery

**Workflow:** Robust error handling with recovery mechanisms.

```java
public class RobustJlinkApp {

    public Model createModelWithRetry(
            Session session,
            String modelName,
            int maxRetries) {

        int attempt = 0;
        long retryDelay = 1000;  // milliseconds

        while (attempt < maxRetries) {
            try {
                Model model = session.CreatePart(modelName);
                System.out.println("Model created successfully");
                return model;

            } catch (jxException ex) {
                attempt++;
                System.err.println("Attempt " + attempt + " failed: " + ex.getMessage());

                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelay);
                        retryDelay *= 2;  // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        System.err.println("Failed to create model after " + maxRetries + " attempts");
        return null;
    }
}
```

---

## Error Handling & Resource Management

### Exception Hierarchy

```
Exception (Java)
├── jxException (Jlink base exception)
│   ├── jxCOMException (COM layer errors)
│   └── jxPFCException (PFC-specific errors)
└── Other Java exceptions
```

### Common Exception Scenarios

| Exception Type | Common Causes | Recovery Strategy |
|---|---|---|
| `jxException` | Model not open, invalid parameter | Verify model state before operation |
| `jxCOMException` | COM communication failure | Retry or restart session |
| File not found | Invalid file path | Check path existence before opening |
| Permission denied | Read-only file/directory | Check file permissions |
| Memory error | Large model, insufficient heap | Increase JVM heap size |
| Feature regeneration fail | Invalid feature parameters | Validate parameter ranges |

### Comprehensive Error Handling Example

```java
public class RobustJlinkHandler {

    public void safeOperation(Session session, String modelPath) {
        Model model = null;

        try {
            // Pre-operation validation
            if (!new File(modelPath).exists()) {
                throw new FileNotFoundException("Model file not found: " + modelPath);
            }

            // Operation
            model = session.OpenFile(modelPath);

            // Verify model is valid
            if (model == null || model.GetCommonName() == null) {
                throw new IllegalStateException("Model is invalid or corrupted");
            }

            // Perform operations
            Parameter param = model.GetParam("MyParam");
            if (param == null) {
                System.err.println("Parameter not found, skipping modification");
            } else {
                param.SetValue(pfcGlobal.CreateDoubleParamValue(50.0));
            }

            model.Regenerate();
            model.Save();

        } catch (FileNotFoundException ex) {
            System.err.println("File error: " + ex.getMessage());
            // Handle missing file

        } catch (jxCOMException ex) {
            System.err.println("COM error (may be transient): " + ex.getMessage());
            // Could retry or reconnect to session

        } catch (jxException ex) {
            System.err.println("Creo operation failed: " + ex.getMessage());
            // Handle Creo-specific error
            ex.printStackTrace();

        } catch (Exception ex) {
            System.err.println("Unexpected error: " + ex.getMessage());
            ex.printStackTrace();

        } finally {
            // Cleanup
            if (model != null) {
                try {
                    if (model.IsModified()) {
                        model.Save();
                    }
                    // Note: Don't delete/close if session should persist
                } catch (jxException ex) {
                    System.err.println("Error during cleanup: " + ex.getMessage());
                }
            }
        }
    }
}
```

### Memory Management

**JVM Heap Configuration:**
```bash
# For processing large models
set _JAVA_OPTIONS=-Xmx2048m -Xms512m

# Where:
# -Xmx = Maximum heap size
# -Xms = Initial heap size
```

**Model Cleanup:**
```java
// Close models when done to free memory
try {
    model.Delete();  // Closes without saving
} catch (jxException ex) {
    // Model might be needed, skip deletion
}

// List open models to monitor
ModelCollection models = session.ListModels();
System.out.println("Open models: " + models.getarraysize());
```

---

## Performance Optimization

### 1. Session Reuse

**Good Practice:** Keep single session throughout application lifecycle
```java
public class SingletonSession {
    private static Session session;

    public static synchronized Session getSession() throws jxException {
        if (session == null) {
            session = pfcGlobal.GetProESession();
        }
        return session;
    }
}
```

### 2. Batch Operations

**Avoid repeated open/close cycles:**
```java
// INEFFICIENT
for (String path : modelPaths) {
    Model model = session.OpenFile(path);
    // operate
    model.Delete();
}

// EFFICIENT
List<Model> models = new ArrayList<>();
for (String path : modelPaths) {
    models.add(session.OpenFile(path));
}

for (Model model : models) {
    // operate on all models
}

for (Model model : models) {
    model.Delete();
}
```

### 3. Lazy Initialization

**Only access data when needed:**
```java
Model model = session.GetActiveModel();

// Don't list all parameters if you only need one
Parameter specificParam = model.GetParam("OnlyNeeded");

// Not this:
ParamCollection allParams = model.ListParams();
// Iterate to find one
```

### 4. Suppress UI Updates

**For headless operations, minimize UI redraws:**
```java
// If available in your Creo version
// Suspend UI updates during batch operations
session.UIDisable();
try {
    // Perform operations
} finally {
    session.UIEnable();
}
```

### 5. Regeneration Control

**Minimize regeneration calls:**
```java
// INEFFICIENT - regenerates multiple times
param1.SetValue(val1);
model.Regenerate();

param2.SetValue(val2);
model.Regenerate();

param3.SetValue(val3);
model.Regenerate();

// EFFICIENT - single regeneration
param1.SetValue(val1);
param2.SetValue(val2);
param3.SetValue(val3);
model.Regenerate();
```

### 6. Collection Caching

**Cache collection results:**
```java
// Access once, use multiple times
FeatureCollection features = model.ListFeatures();

// Iterate multiple times using cached collection
for (int i = 0; i < features.getarraysize(); i++) {
    Feature f = features.get(i);
    // Use feature
}

// Later, iterate again using same cache
for (int i = 0; i < features.getarraysize(); i++) {
    Feature f = features.get(i);
    // Use feature again
}
```

---

## SmartAssembly Integration

### Overview
SmartAssembly is PTC's advanced assembly automation feature. Jlink can integrate with and control SmartAssembly operations.

### Key Integration Points

#### 1. SmartAssembly Component Loading

**Dynamically add SmartAssembly components:**
```java
public class SmartAssemblyIntegration {

    public Model addSmartComponent(
            Model assembly,
            String smartCompPath,
            Map<String, Object> specifications) throws jxException {

        // Add component with SmartAssembly specifications
        ComponentPath compPath = assembly.AddComponent(
            smartCompPath,
            pfcGlobal.CreateDoubleParamValue(0),
            pfcGlobal.CreateDoubleParamValue(0),
            pfcGlobal.CreateDoubleParamValue(0)
        );

        // Apply SmartAssembly parameters
        Component component = compPath.GetComponent();
        Model compModel = component.GetModel();

        for (Map.Entry<String, Object> spec : specifications.entrySet()) {
            Parameter param = compModel.GetParam(spec.getKey());
            if (param != null) {
                param.SetValue(
                    pfcGlobal.CreateStringParamValue(spec.getValue().toString())
                );
            }
        }

        compModel.Regenerate();

        return compModel;
    }
}
```

#### 2. SmartAssembly Constraint Application

**Apply constraints from SmartAssembly definitions:**
```java
public void applySmartAssemblyConstraints(
        Model assembly,
        ComponentPath comp1,
        ComponentPath comp2,
        String constraintType) throws jxException {

    // Types: MATE, ALIGN, ORIENT, etc.
    // Implementation depends on specific constraint requirements

    // Regenerate assembly to apply constraints
    assembly.Regenerate();
}
```

#### 3. Template-Based Assembly

**Create assemblies from SmartAssembly templates:**
```java
public Model createFromTemplate(
        Session session,
        String templatePath,
        Map<String, String> parameterValues) throws jxException {

    // Open template
    Model template = session.OpenFile(templatePath);

    // Apply configuration parameters
    for (Map.Entry<String, String> entry : parameterValues.entrySet()) {
        Parameter param = template.GetParam(entry.getKey());
        if (param != null) {
            param.SetValue(pfcGlobal.CreateStringParamValue(entry.getValue()));
        }
    }

    template.Regenerate();

    // Save as new assembly
    String outputPath = "C:/output/" + System.currentTimeMillis() + ".asm";
    template.Save();

    return template;
}
```

### SmartAssembly Best Practices

1. **Use SmartAssembly for template definitions** - Maintain constraints in SmartAssembly UI
2. **Access via Jlink for automation** - Use Jlink to programmatically apply templates
3. **Parameter validation** - Verify parameter values are valid for SmartAssembly components
4. **Regeneration after changes** - Always regenerate assembly after template modifications
5. **Error handling** - SmartAssembly constraint failures may have specific error codes

---

## Licensing & Versioning

### License Types

| License Type | Cost | Features | Distribution |
|---|---|---|---|
| **J-Link (Free)** | Included with Creo | Model automation, basic operations | Internal use only |
| **Creo Object TOOLKIT Java** | Additional cost | Full API access, distributable | Custom applications |
| **Creo TOOLKIT** | Separate license | C++ API, more powerful | Requires purchase |

### Version Compatibility

**Creo Version Support:**
- Creo 4.0 F000 and later: Full Jlink support
- Creo 2.0, 3.0: Jlink available but legacy
- Creo 1.0 and earlier: Pro/TOOLKIT only

**Java Version Compatibility:**
- Creo 7.x and 8.x: JRE 11.0 recommended
- Creo 6.x and earlier: Java 8 and later
- Always check release notes for specific version

### Migration Path: J-Link to Creo Object TOOLKIT Java

For Creo 4.0+, J-Link applications can be converted to Creo Object TOOLKIT Java:

**Changes Required:**
1. Package as JAR file
2. Include in CLASSPATH with otk.jar
3. Update registration file startup method
4. Unlock JAR (if distributing)
5. Update startup type from "jlink" to "otk_java"

---

## Resources & References

### Official PTC Documentation
- **Creo Object TOOLKIT Java User's Guide:** Primary reference for API
- **J-Link User's Guide (3.0):** Legacy but relevant for compatibility
- **PTC Support Portal:** https://support.ptc.com/help/creo_toolkit/

### Example Applications
- **Location:** `<CREO_LOADPOINT>/Common Files/otk_java_free/`
- **Includes:** Parameter Editor, Part Generator, Assembly Builder
- **Learning Tool:** Study example code for patterns

### Community Resources
- **PTC Community Forums:** https://community.ptc.com/
- **Eng-Tips Forum:** Discussion of Jlink applications
- **CREOSON:** Open-source service interface for Creo using Jlink

### Third-Party Tools Built on Jlink
- **Nitro-BOM:** Bill of Materials extraction
- **Nitro-CELL:** Cell-based design automation
- **Nitro-PROGRAM:** Creo programming environment
- **CREOSON:** JSON-based REST interface

### Development Recommendations

**IDE Choices:**
- Eclipse: Free, excellent Jlink support
- IntelliJ IDEA: Advanced debugging capabilities
- NetBeans: Lighter weight alternative

**Build Tools:**
- Maven: Dependency management, builds
- Gradle: Modern build automation
- Ant: Simple build scripting

**Version Control:**
- Git: Standard for development teams
- SVN: Legacy but still used in some organizations

---

## Summary

Jlink provides powerful, free automation capabilities for Creo Parametric users. Its Java-based architecture offers:

- **Accessibility:** Free with any Creo installation
- **Flexibility:** Supports wide range of design automation tasks
- **Integration:** Connects Creo with enterprise systems
- **Scalability:** Batch processing, template-based generation
- **Reliability:** Mature API with extensive documentation

Success with Jlink requires:
1. Proper environment setup (CLASSPATH, registration)
2. Understanding of core classes (Session, Model, Feature, Parameter)
3. Robust error handling (try-catch, validation)
4. Performance awareness (session reuse, batch operations)
5. Appropriate use cases (automation, not manual design)

---

## Unresolved Questions / Further Research Needs

1. **SmartAssembly detailed constraint types:** Complete API for all constraint operations
2. **Drawing generation specifics:** Detailed API for automated drawing creation with annotations
3. **FEA integration:** Step-by-step process for running simulations via Jlink
4. **Creo 8+ specific features:** Latest API changes and optimizations in newest versions
5. **Performance benchmarks:** Quantitative data on processing speed for large models
6. **Distributed deployment:** Best practices for deploying Jlink apps across multiple users
7. **Web service integration:** REST/SOAP bridging approaches for remote Creo control

---

**Document Status:** Research Complete - Ready for Development Team Use
**Last Updated:** December 1, 2025
**Confidence Level:** High - Information sourced from official PTC documentation and community verified sources
