# Jlink Metadata Extractor - Implementation Plan
**Date:** 2025-12-01
**Type:** Standalone Java Application
**Framework:** Jlink (Creo Object TOOLKIT Java)
**Status:** Implementation Ready

---

## Executive Summary

Standalone Java application using Jlink API to batch-process .prt/.asm files, extract complete metadata (features, parameters, properties, constraints), and generate markdown documentation alongside source models. Single-session architecture ensures robust error handling without stopping batch execution.

---

## 1. Architecture Overview

### 1.1 High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Application                        │
│  Entry point, CLI args parsing, session lifecycle mgmt     │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► Session Manager (Jlink session control)
             │
             ├──► Directory Scanner (recursive file finder)
             │
             ├──► Model Processor (metadata extraction)
             │
             ├──► Markdown Generator (format output)
             │
             └──► Error Logger (non-blocking failures)
```

### 1.2 Component Interactions

```
[Main] → [Scanner] → finds files → [Processor]
                                        ↓
                          opens model via [Session]
                                        ↓
                          extracts metadata → [Markdown Gen]
                                        ↓
                          writes .md → disk
                                        ↓
                          errors → [Logger] (continue processing)
```

---

## 2. Component Specifications

### 2.1 Main Application (`MetadataExtractorApp.java`)

**Responsibilities:**
- Parse CLI arguments (root directory, file extensions, output options)
- Initialize Jlink session (single session for entire batch)
- Coordinate scanner → processor → generator workflow
- Handle critical errors (session failure, invalid directory)
- Cleanup resources on completion

**Key Methods:**
```java
public static void main(String[] args)
public void initialize(String rootDir)
public void processBatch()
public void cleanup()
```

**CLI Arguments:**
```bash
java -jar metadata-extractor.jar \
  --root "C:/models" \
  --extensions ".prt,.asm" \
  --output-format "markdown" \
  --log-file "errors.log"
```

---

### 2.2 Session Manager (`JlinkSessionManager.java`)

**Responsibilities:**
- Establish Jlink session with Creo Parametric
- Maintain single session throughout batch processing
- Validate session health before model operations
- Handle session-level errors (COM failures, Creo crashes)
- Provide session singleton to other components

**Key Methods:**
```java
public static Session getSession() throws jxException
public static boolean isSessionValid()
public static void closeSession()
public Model openModel(String filePath) throws jxException
public void closeModel(Model model) throws jxException
```

**Pattern:**
```java
public class JlinkSessionManager {
    private static Session session = null;

    public static synchronized Session getSession() throws jxException {
        if (session == null) {
            session = pfcGlobal.GetProESession();
        }
        return session;
    }
}
```

---

### 2.3 Directory Scanner (`DirectoryScanner.java`)

**Responsibilities:**
- Recursively traverse directory tree
- Filter files by extension (.prt, .asm)
- Return list of absolute file paths
- Skip inaccessible directories (log warning, continue)

**Key Methods:**
```java
public List<File> scanDirectory(String rootPath, String[] extensions)
private boolean isValidModelFile(File file, String[] extensions)
```

**Implementation:**
```java
public List<File> scanDirectory(String rootPath, String[] extensions) {
    List<File> models = new ArrayList<>();
    File root = new File(rootPath);

    if (!root.exists() || !root.isDirectory()) {
        ErrorLogger.warn("Invalid directory: " + rootPath);
        return models;
    }

    try {
        Files.walk(Paths.get(rootPath))
            .filter(p -> isValidModelFile(p.toFile(), extensions))
            .forEach(p -> models.add(p.toFile()));
    } catch (IOException ex) {
        ErrorLogger.error("Scan failed: " + ex.getMessage());
    }

    return models;
}
```

---

### 2.4 Model Processor (`ModelMetadataProcessor.java`)

**Responsibilities:**
- Open model via session manager
- Extract complete metadata structure
- Handle feature-specific errors (suppressed features, failed features)
- Return structured metadata object
- Close model after processing

**Key Methods:**
```java
public ModelMetadata extractMetadata(File modelFile)
private BasicInfo extractBasicInfo(Model model)
private List<ParameterInfo> extractParameters(Model model)
private List<FeatureInfo> extractFeatures(Model model)
private AssemblyInfo extractAssemblyData(Model model)
private PropertyInfo extractProperties(Model model)
```

**Metadata Structure:**
```java
public class ModelMetadata {
    // Basic info
    String modelName;
    String modelType;          // PART, ASSEMBLY, DRAWING
    String filePath;
    long fileSize;
    Date createdDate;
    Date modifiedDate;

    // Parameters
    List<ParameterInfo> parameters;

    // Features (parts only)
    List<FeatureInfo> features;

    // Assembly data
    AssemblyInfo assemblyInfo; // null for parts

    // Properties
    PropertyInfo properties;

    // Errors/warnings
    List<String> errors;
}

public class ParameterInfo {
    String name;
    String type;            // DOUBLE, INTEGER, STRING, BOOLEAN
    String value;
    String units;           // if applicable
}

public class FeatureInfo {
    int id;
    String name;
    String type;            // EXTRUDE, CUT, HOLE, etc.
    boolean suppressed;
    List<DimensionInfo> dimensions;
    String failureReason;   // if feature failed to load
}

public class AssemblyInfo {
    List<ComponentInfo> components;
    List<ConstraintInfo> constraints;
}

public class ComponentInfo {
    String name;
    String filePath;
    String type;            // PART, SUBASSEMBLY
}

public class PropertyInfo {
    double mass;
    double surfaceArea;
    List<String> coordinateSystems;
}
```

**Feature Extraction (Robust):**
```java
private List<FeatureInfo> extractFeatures(Model model) {
    List<FeatureInfo> featureList = new ArrayList<>();

    try {
        FeatureCollection features = model.ListFeatures();

        if (features != null) {
            for (int i = 0; i < features.getarraysize(); i++) {
                try {
                    Feature feat = features.get(i);
                    FeatureInfo info = new FeatureInfo();

                    info.id = feat.GetId();
                    info.name = feat.GetName();
                    info.type = feat.GetFeatType().toString();
                    info.suppressed = feat.IsSuppressed();

                    // Extract dimensions (may fail for some features)
                    try {
                        info.dimensions = extractDimensions(feat);
                    } catch (jxException ex) {
                        info.failureReason = "Dimension extraction failed";
                    }

                    featureList.add(info);

                } catch (jxException ex) {
                    // Feature failed to load - log but continue
                    FeatureInfo errorInfo = new FeatureInfo();
                    errorInfo.id = i;
                    errorInfo.failureReason = ex.getMessage();
                    featureList.add(errorInfo);
                }
            }
        }

    } catch (jxException ex) {
        ErrorLogger.error("Feature list extraction failed: " + ex.getMessage());
    }

    return featureList;
}
```

---

### 2.5 Markdown Generator (`MarkdownGenerator.java`)

**Responsibilities:**
- Convert ModelMetadata to formatted markdown
- Write markdown to file (same directory as model)
- Follow naming convention: `ModelName_metadata.md`
- Create readable, structured documentation

**Key Methods:**
```java
public void generateMarkdown(ModelMetadata metadata, File outputDir)
private String formatBasicInfo(ModelMetadata metadata)
private String formatParameters(List<ParameterInfo> params)
private String formatFeatures(List<FeatureInfo> features)
private String formatAssemblyInfo(AssemblyInfo assemblyInfo)
```

**Output Format:**
```markdown
# Model Metadata: PartName

**Type:** PART
**File:** C:/models/project/PartName.prt
**Size:** 1.2 MB
**Created:** 2025-11-15 10:30:00
**Modified:** 2025-12-01 14:22:10

---

## Parameters

| Name | Type | Value | Units |
|------|------|-------|-------|
| LENGTH | DOUBLE | 100.0 | mm |
| WIDTH | DOUBLE | 50.0 | mm |
| MATERIAL | STRING | Steel | - |

---

## Features

### Feature 1: Base Extrude
- **Type:** EXTRUDE
- **ID:** 42
- **Status:** Active
- **Dimensions:**
  - Depth: 25.0 mm
  - Direction: Normal

### Feature 2: Pocket Cut
- **Type:** CUT
- **ID:** 43
- **Status:** Suppressed
- **Dimensions:**
  - Depth: 10.0 mm

---

## Assembly Information

### Subcomponents
1. **bolt.prt** (C:/models/hardware/bolt.prt)
2. **plate.prt** (C:/models/project/plate.prt)

### Constraints
1. Mate: bolt → plate (Surface alignment)
2. Align: bolt axis → hole axis

---

## Properties

- **Mass:** 0.45 kg
- **Surface Area:** 1250.0 mm²
- **Coordinate Systems:**
  - CS0 (Origin)
  - CS_MOUNTING

---

## Errors/Warnings

⚠️ Feature 5 failed to load: Invalid geometry reference
⚠️ Parameter 'SUPPLIER' not found
```

**File Naming:**
```java
public void generateMarkdown(ModelMetadata metadata, File outputDir) {
    String baseFileName = metadata.modelName + "_metadata.md";
    File outputFile = new File(outputDir, baseFileName);

    try (FileWriter writer = new FileWriter(outputFile)) {
        writer.write(buildMarkdownContent(metadata));
        System.out.println("✓ Generated: " + outputFile.getAbsolutePath());
    } catch (IOException ex) {
        ErrorLogger.error("Failed to write markdown: " + ex.getMessage());
    }
}
```

---

### 2.6 Error Logger (`ErrorLogger.java`)

**Responsibilities:**
- Log non-critical errors without stopping batch
- Write errors to console and log file
- Track processing statistics (success/failure counts)
- Provide summary report at end

**Key Methods:**
```java
public static void error(String message)
public static void warn(String message)
public static void info(String message)
public static void logModelFailure(String modelPath, Exception ex)
public static void printSummary()
```

**Implementation:**
```java
public class ErrorLogger {
    private static final List<String> errors = new ArrayList<>();
    private static int successCount = 0;
    private static int failureCount = 0;

    public static synchronized void logModelFailure(String modelPath, Exception ex) {
        String msg = String.format("[FAIL] %s: %s", modelPath, ex.getMessage());
        errors.add(msg);
        failureCount++;
        System.err.println(msg);
    }

    public static void printSummary() {
        System.out.println("\n=== Processing Summary ===");
        System.out.println("Success: " + successCount);
        System.out.println("Failures: " + failureCount);
        System.out.println("Total Errors: " + errors.size());

        if (!errors.isEmpty()) {
            System.out.println("\nError Details:");
            errors.forEach(System.err::println);
        }
    }
}
```

---

## 3. Implementation Phases

### Phase 1: Foundation (Day 1)
**Deliverables:**
- Project structure (Maven/Gradle)
- Jlink session manager with basic open/close
- Directory scanner with filtering
- Error logger with console output

**Success Criteria:**
- Can establish Jlink session
- Can scan directory and list .prt/.asm files
- Errors logged without crashes

---

### Phase 2: Basic Metadata Extraction (Day 2)
**Deliverables:**
- Model processor with basic info extraction
- Parameter extraction (name, type, value)
- Simple markdown generator (basic info only)

**Success Criteria:**
- Can open model and extract name, type, path
- Can list all parameters with values
- Generates markdown with basic info + parameters

---

### Phase 3: Feature Extraction (Day 3)
**Deliverables:**
- Feature extraction with error handling
- Dimension extraction from features
- Suppression status detection
- Enhanced markdown with feature tree

**Success Criteria:**
- Extracts all features (even if some fail)
- Shows suppressed vs. active features
- Markdown includes feature tree with details

---

### Phase 4: Assembly Support (Day 4)
**Deliverables:**
- Assembly component extraction
- Constraint extraction
- Component path resolution
- Assembly-specific markdown sections

**Success Criteria:**
- Lists all subcomponents with paths
- Shows constraint relationships
- Differentiates part vs. assembly output

---

### Phase 5: Properties & Polish (Day 5)
**Deliverables:**
- Mass/surface area extraction
- Coordinate system listing
- File metadata (size, dates)
- Final markdown formatting
- Performance optimization

**Success Criteria:**
- Complete metadata coverage
- Professional markdown output
- Processes 100+ models without issues
- Performance: ~5-10 seconds per model

---

## 4. Package Structure

```
src/main/java/com/jac/metadata/
├── MetadataExtractorApp.java          # Main entry point
├── session/
│   └── JlinkSessionManager.java       # Session lifecycle
├── scanner/
│   └── DirectoryScanner.java          # File discovery
├── processor/
│   ├── ModelMetadataProcessor.java    # Core extraction
│   └── metadata/                      # Data models
│       ├── ModelMetadata.java
│       ├── ParameterInfo.java
│       ├── FeatureInfo.java
│       ├── AssemblyInfo.java
│       └── PropertyInfo.java
├── generator/
│   └── MarkdownGenerator.java         # Output formatting
└── util/
    └── ErrorLogger.java               # Error handling

resources/
└── logging.properties                 # Java logging config
```

---

## 5. Error Handling Strategy

### 5.1 Error Categories

| Error Type | Severity | Action |
|------------|----------|--------|
| Session failure | CRITICAL | Exit application |
| Model open failure | HIGH | Skip model, log error, continue |
| Feature extraction failure | MEDIUM | Mark feature as failed, continue |
| Parameter missing | LOW | Log warning, continue |
| Markdown write failure | MEDIUM | Log error, continue processing |

### 5.2 Error Recovery

```java
public void processBatch(List<File> modelFiles) {
    for (File modelFile : modelFiles) {
        try {
            // Process single model
            ModelMetadata metadata = processor.extractMetadata(modelFile);
            generator.generateMarkdown(metadata, modelFile.getParentFile());
            ErrorLogger.recordSuccess();

        } catch (jxException ex) {
            // Model-level error - log and continue
            ErrorLogger.logModelFailure(modelFile.getPath(), ex);

        } catch (Exception ex) {
            // Unexpected error - log and continue
            ErrorLogger.error("Unexpected error: " + ex.getMessage());
        }
    }
}
```

### 5.3 Graceful Degradation

**Strategy:** Partial metadata is better than no metadata.

```java
public ModelMetadata extractMetadata(File modelFile) throws jxException {
    ModelMetadata metadata = new ModelMetadata();
    Model model = null;

    try {
        model = sessionManager.openModel(modelFile.getAbsolutePath());

        // Always try to extract basic info
        try {
            metadata.basicInfo = extractBasicInfo(model);
        } catch (jxException ex) {
            metadata.errors.add("Basic info extraction failed: " + ex.getMessage());
        }

        // Try parameters (may partially fail)
        try {
            metadata.parameters = extractParameters(model);
        } catch (jxException ex) {
            metadata.errors.add("Parameter extraction failed: " + ex.getMessage());
        }

        // Try features (continue on individual feature failures)
        try {
            metadata.features = extractFeatures(model); // Internally handles failures
        } catch (jxException ex) {
            metadata.errors.add("Feature list extraction failed: " + ex.getMessage());
        }

        // Assembly-specific (skip if part)
        if (model.GetType() == ModelType.MDL_ASSEMBLY) {
            try {
                metadata.assemblyInfo = extractAssemblyData(model);
            } catch (jxException ex) {
                metadata.errors.add("Assembly data extraction failed: " + ex.getMessage());
            }
        }

        return metadata;

    } finally {
        if (model != null) {
            try {
                sessionManager.closeModel(model);
            } catch (jxException ex) {
                ErrorLogger.warn("Model close failed: " + ex.getMessage());
            }
        }
    }
}
```

---

## 6. Performance Considerations

### 6.1 Session Reuse
- **Single session** for entire batch (avoid repeated startup overhead)
- Session initialized once at application start
- Reused for all model operations

### 6.2 Model Lifecycle
- Open → Extract → Close pattern for each model
- Don't keep multiple models open simultaneously (memory)
- Use `model.Delete()` to free memory after processing

### 6.3 Batch Processing Optimization
```java
// Process models in chunks to allow JVM garbage collection
private void processInChunks(List<File> allFiles, int chunkSize) {
    for (int i = 0; i < allFiles.size(); i += chunkSize) {
        int end = Math.min(i + chunkSize, allFiles.size());
        List<File> chunk = allFiles.subList(i, end);

        processChunk(chunk);

        // Allow GC between chunks
        System.gc();
    }
}
```

### 6.4 Large Model Handling
- Set JVM heap size appropriately:
  ```bash
  java -Xmx4096m -Xms1024m -jar metadata-extractor.jar
  ```
- Monitor memory usage during batch processing
- Consider parallel processing for independent models (future enhancement)

### 6.5 Expected Performance
- **Small models (<1MB):** ~2-3 seconds per model
- **Medium models (1-10MB):** ~5-10 seconds per model
- **Large models (>10MB):** ~15-30 seconds per model
- **Batch of 100 models:** ~10-20 minutes

---

## 7. Build Configuration

### 7.1 Maven `pom.xml`
```xml
<project>
    <groupId>com.jac</groupId>
    <artifactId>metadata-extractor</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Jlink (local JAR) -->
        <dependency>
            <groupId>com.ptc</groupId>
            <artifactId>otk</artifactId>
            <version>1.0</version>
            <scope>system</scope>
            <systemPath>${env.CREO_LOADPOINT}/Common Files/otk/otk_java/otk.jar</systemPath>
        </dependency>

        <!-- Logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>1.7.36</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.2.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>com.jac.metadata.MetadataExtractorApp</mainClass>
                        </manifest>
                    </archive>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### 7.2 Environment Variables
```bash
# Windows
set CREO_LOADPOINT=C:\Program Files\PTC\Creo 8.0\Common Files
set CLASSPATH=%CREO_LOADPOINT%\otk\otk_java\otk.jar;target\metadata-extractor-1.0.0.jar
set _JAVA_OPTIONS=-Xmx4096m -Xms1024m

# Linux/Mac
export CREO_LOADPOINT=/opt/ptc/creo/8.0/Common Files
export CLASSPATH=$CREO_LOADPOINT/otk/otk_java/otk.jar:target/metadata-extractor-1.0.0.jar
export _JAVA_OPTIONS="-Xmx4096m -Xms1024m"
```

---

## 8. Testing Strategy

### 8.1 Unit Tests
```java
// Test scanner
@Test
public void testDirectoryScan() {
    DirectoryScanner scanner = new DirectoryScanner();
    List<File> files = scanner.scanDirectory("test/models", new String[]{".prt", ".asm"});
    assertTrue(files.size() > 0);
}

// Test metadata extraction (requires Creo running)
@Test
public void testParameterExtraction() throws jxException {
    Session session = JlinkSessionManager.getSession();
    Model model = session.OpenFile("test/models/sample.prt");

    ModelMetadataProcessor processor = new ModelMetadataProcessor();
    List<ParameterInfo> params = processor.extractParameters(model);

    assertNotNull(params);
    assertTrue(params.size() > 0);
}
```

### 8.2 Integration Tests
- **Test Set:** 10 sample models (mix of parts/assemblies)
- **Scenarios:**
  - Simple part with basic features
  - Complex part with 50+ features
  - Assembly with 10+ components
  - Model with suppressed features
  - Model with missing parameters (should handle gracefully)

### 8.3 Error Scenario Tests
- File not found
- Corrupted model file
- Model with invalid features
- Disk full (markdown write failure)
- Creo session lost during processing

---

## 9. Deployment

### 9.1 Packaging
```bash
# Build JAR
mvn clean package

# Verify JAR contents
jar tf target/metadata-extractor-1.0.0.jar
```

### 9.2 Distribution
```
metadata-extractor/
├── metadata-extractor-1.0.0.jar
├── run.bat                           # Windows launch script
├── run.sh                            # Linux launch script
├── README.md                         # Usage instructions
└── config/
    └── logging.properties
```

### 9.3 Launch Scripts

**run.bat (Windows):**
```batch
@echo off
set CREO_LOADPOINT=C:\Program Files\PTC\Creo 8.0\Common Files
set CLASSPATH=%CREO_LOADPOINT%\otk\otk_java\otk.jar;metadata-extractor-1.0.0.jar
set _JAVA_OPTIONS=-Xmx4096m -Xms1024m

java -cp %CLASSPATH% com.jac.metadata.MetadataExtractorApp ^
  --root "%1" ^
  --extensions ".prt,.asm" ^
  --log-file "errors.log"

pause
```

**run.sh (Linux/Mac):**
```bash
#!/bin/bash
export CREO_LOADPOINT=/opt/ptc/creo/8.0/Common Files
export CLASSPATH=$CREO_LOADPOINT/otk/otk_java/otk.jar:metadata-extractor-1.0.0.jar
export _JAVA_OPTIONS="-Xmx4096m -Xms1024m"

java -cp $CLASSPATH com.jac.metadata.MetadataExtractorApp \
  --root "$1" \
  --extensions ".prt,.asm" \
  --log-file "errors.log"
```

### 9.4 Usage
```bash
# Windows
run.bat "C:\models\project"

# Linux/Mac
./run.sh "/home/user/models/project"
```

---

## 10. Future Enhancements

### 10.1 Parallel Processing
- Process multiple models simultaneously (thread pool)
- Requires multiple Jlink sessions or session locking

### 10.2 Output Formats
- JSON export for machine parsing
- HTML with navigation/search
- Excel spreadsheet with all models

### 10.3 Filtering Options
- Process only modified files (timestamp check)
- Skip models with existing metadata (incremental mode)
- Filter by model type (parts only, assemblies only)

### 10.4 Advanced Metadata
- Material properties
- BOM (Bill of Materials) generation
- Drawing view extraction
- Simulation results

### 10.5 Web Interface
- Upload models via browser
- View metadata online
- Compare model versions

---

## Appendix A: Key Constraints & Assumptions

### Constraints
1. **Jlink Availability:** Creo Object TOOLKIT Java installed
2. **Creo Version:** 4.0 F000 or later
3. **Java Version:** JDK 11 or later
4. **Memory:** Minimum 4GB RAM recommended
5. **Disk Space:** 2x model size for markdown output

### Assumptions
1. Creo Parametric is installed and licensed
2. User has read access to model directories
3. Models are not corrupted (basic validation)
4. Single user (not concurrent access to same models)
5. Network paths are mounted (if models on network)

---

## Appendix B: Unresolved Questions

1. **SmartAssembly Constraints:** How to extract SmartAssembly-specific constraint data?
2. **Drawing Automation:** Should we support drawing files (.drw)?
3. **Version Control:** Should metadata track model version history?
4. **Cloud Storage:** Support for Windchill/cloud-based models?
5. **Localization:** Support for non-English Creo installations?

---

**Plan Status:** Implementation Ready
**Estimated Development Time:** 5 days (1 developer)
**Risk Level:** Low (proven Jlink API, well-defined scope)
**Dependencies:** Creo installation, Jlink license
