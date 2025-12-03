# Jlink Complete Patterns & Workflows

End-to-end patterns for common Jlink tasks.

## Pattern 1: Batch Model Parameter Update

**Use case:** Modify parameters in multiple models

```java
public class BatchParameterUpdater {

    private Session session;
    private Map<String, Double> parameterUpdates;

    public BatchParameterUpdater() throws jxthrowable {
        this.session = pfcSession.GetCurrentSessionWithCompatibility(
            CreoCompatibility.C4Compatible
        );
        this.parameterUpdates = new HashMap<>();
    }

    public void updateModels(List<String> modelNames) {
        session.UISetComputeMode(true);

        int success = 0;
        int failed = 0;

        for (String modelName : modelNames) {
            try {
                Model model = retrieveModel(modelName);
                applyParameterUpdates(model);
                model.Regenerate(null);
                model.Save();
                success++;
            } catch (jxthrowable x) {
                System.out.println("Failed to update " + modelName + ": "
                    + x.getMessage());
                failed++;
            }
        }

        session.UISetComputeMode(false);
        System.out.println("Complete: " + success + " succeeded, "
            + failed + " failed");
    }

    private Model retrieveModel(String name) throws jxthrowable {
        ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_PART, name, null
        );
        return session.RetrieveModel(descr);
    }

    private void applyParameterUpdates(Model model) throws jxthrowable {
        for (Map.Entry<String, Double> entry : parameterUpdates.entrySet()) {
            try {
                Parameter param = model.GetParam(entry.getKey());
                param.SetValue(
                    pfcParameter.ParamValue_CreateDoubleParamValue(
                        entry.getValue()
                    )
                );
            } catch (jxthrowable x) {
                System.out.println("  Parameter not found: " + entry.getKey());
            }
        }
    }

    public void addParameterUpdate(String paramName, double value) {
        parameterUpdates.put(paramName, value);
    }
}

// Usage
BatchParameterUpdater updater = new BatchParameterUpdater();
updater.addParameterUpdate("THICKNESS", 2.5);
updater.addParameterUpdate("WIDTH", 100.0);
updater.updateModels(Arrays.asList("part1", "part2", "part3"));
```

## Pattern 2: Assembly Generation from Spreadsheet Data

**Use case:** Create assembly from external data source

```java
public class AssemblyFromDataGenerator {

    private Session session;
    private Model assembly;

    public AssemblyFromDataGenerator(String assemblyName) throws jxthrowable {
        this.session = pfcSession.GetCurrentSessionWithCompatibility(
            CreoCompatibility.C4Compatible
        );
        this.assembly = createNewAssembly(assemblyName);
    }

    private Model createNewAssembly(String name) throws jxthrowable {
        ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_ASSEMBLY, name, null
        );
        return session.CreateModel(descr, null);
    }

    public void addComponents(List<ComponentData> components) throws jxthrowable {
        session.UISetComputeMode(true);

        int position = 0;
        for (ComponentData data : components) {
            try {
                addComponent(data, position++);
            } catch (jxthrowable x) {
                System.out.println("Failed to add component: "
                    + data.getPartName());
            }
        }

        session.UISetComputeMode(false);
        assembly.Regenerate(null);
    }

    private void addComponent(ComponentData data, int position)
            throws jxthrowable {

        ModelDescriptor compDescr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_PART, data.getPartName(), null
        );

        FeatureCreateData compData = pfcFeature.FeatureCreate_Create(
            FeatureType.COMPONENT,
            ModelRef.CURRENT,
            data.getComponentName(),
            compDescr,
            null
        );

        Feature comp = assembly.CreateFeature(compData);

        // Apply constraints from data (if needed)
        if (data.getConstraintType() != null) {
            applyConstraint(comp, data);
        }
    }

    private void applyConstraint(Feature comp, ComponentData data)
            throws jxthrowable {
        // Apply constraint based on data
        // (example: fix first component)
        if ("FIX".equals(data.getConstraintType())) {
            Constraint fixConstraint = pfcConstraint.Constraint_CreateFixConstraint(
                (ComponentFeat)comp, null
            );
            assembly.AddConstraint(fixConstraint);
        }
    }

    public void saveAssembly() throws jxthrowable {
        assembly.Save();
        System.out.println("Assembly saved: " + assembly.GetModelName());
    }

    public static class ComponentData {
        private String partName;
        private String componentName;
        private String constraintType;

        public ComponentData(String partName, String componentName) {
            this.partName = partName;
            this.componentName = componentName;
        }

        // Getters...
        public String getPartName() { return partName; }
        public String getComponentName() { return componentName; }
        public String getConstraintType() { return constraintType; }
        public void setConstraintType(String type) { this.constraintType = type; }
    }
}

// Usage
AssemblyFromDataGenerator gen = new AssemblyFromDataGenerator("generated_assembly");

List<AssemblyFromDataGenerator.ComponentData> components = new ArrayList<>();
components.add(new ComponentData("base_plate", "BASE"));
components.add(new ComponentData("bracket", "BRACKET_L"));
components.add(new ComponentData("bracket", "BRACKET_R"));

gen.addComponents(components);
gen.saveAssembly();
```

## Pattern 3: Feature Parameter Extraction

**Use case:** Extract all parameters and feature dimensions for reporting

```java
public class FeatureParameterExtractor {

    private Session session;
    private Model model;

    public FeatureParameterExtractor(String modelName) throws jxthrowable {
        this.session = pfcSession.GetCurrentSessionWithCompatibility(
            CreoCompatibility.C4Compatible
        );
        this.model = retrieveModel(modelName);
    }

    private Model retrieveModel(String name) throws jxthrowable {
        ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_PART, name, null
        );
        return session.RetrieveModel(descr);
    }

    public Map<String, Map<String, Object>> extractAll() throws jxthrowable {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();

        // Extract model parameters
        result.put("MODEL_PARAMETERS", extractModelParameters());

        // Extract feature dimensions
        result.put("FEATURE_DIMENSIONS", extractFeatureDimensions());

        return result;
    }

    private Map<String, Object> extractModelParameters() throws jxthrowable {
        Map<String, Object> params = new LinkedHashMap<>();

        ParameterTable paramTable = model.GetParameters();
        Sequence<Parameter> allParams = paramTable.GetParams();

        for (int i = 0; i < allParams.GetMembersCount(); i++) {
            Parameter p = allParams.GetMember(i);

            String name = p.GetName();
            String type = p.GetType().toString();

            Object value;
            try {
                if (p.GetType() == ParamType.DOUBLE) {
                    value = p.GetValue().GetDoubleValue();
                } else if (p.GetType() == ParamType.INTEGER) {
                    value = p.GetValue().GetIntValue();
                } else if (p.GetType() == ParamType.STRING) {
                    value = p.GetValue().GetStringValue();
                } else {
                    value = p.GetValue().toString();
                }
            } catch (jxthrowable x) {
                value = "ERROR";
            }

            params.put(name + " (" + type + ")", value);
        }

        return params;
    }

    private Map<String, Object> extractFeatureDimensions()
            throws jxthrowable {
        Map<String, Object> featureDims = new LinkedHashMap<>();

        FeatureTree featTree = model.GetFeatureTree();
        Sequence<Feature> features = featTree.GetFeatures();

        for (int i = 0; i < features.GetMembersCount(); i++) {
            Feature f = features.GetMember(i);

            String featName = f.GetName();
            FeatureType featType = f.GetFeatType();

            try {
                Sequence<Dimension> dims = f.GetDimensions();

                if (dims.GetMembersCount() > 0) {
                    Map<String, Object> dimMap = new LinkedHashMap<>();

                    for (int j = 0; j < dims.GetMembersCount(); j++) {
                        Dimension dim = dims.GetMember(j);
                        dimMap.put(dim.GetName(), dim.GetValue());
                    }

                    featureDims.put(
                        featName + " (" + featType + ")",
                        dimMap
                    );
                }
            } catch (jxthrowable x) {
                // Feature has no dimensions
            }
        }

        return featureDims;
    }

    public void printReport() throws jxthrowable {
        Map<String, Map<String, Object>> data = extractAll();

        System.out.println("=== PARAMETER EXTRACTION REPORT ===");
        System.out.println("Model: " + model.GetModelName());
        System.out.println();

        for (Map.Entry<String, Map<String, Object>> section : data.entrySet()) {
            System.out.println(section.getKey() + ":");
            for (Map.Entry<String, Object> entry : section.getValue().entrySet()) {
                System.out.println("  " + entry.getKey() + ": " + entry.getValue());
            }
            System.out.println();
        }
    }
}

// Usage
FeatureParameterExtractor extractor = new FeatureParameterExtractor("my_part");
extractor.printReport();

Map<String, Map<String, Object>> data = extractor.extractAll();
// Use data for reporting, export to Excel, etc.
```

## Pattern 4: Model Configuration from Parameters

**Use case:** Change model configuration based on parameter values

```java
public class ConfigurableModelGenerator {

    private Session session;
    private Model model;

    public ConfigurableModelGenerator(String modelName) throws jxthrowable {
        this.session = pfcSession.GetCurrentSessionWithCompatibility(
            CreoCompatibility.C4Compatible
        );
        this.model = retrieveModel(modelName);
    }

    private Model retrieveModel(String name) throws jxthrowable {
        ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_PART, name, null
        );
        return session.RetrieveModel(descr);
    }

    public void configureByType(String typeCode) throws jxthrowable {
        switch (typeCode) {
            case "STANDARD":
                configureStandard();
                break;
            case "COMPACT":
                configureCompact();
                break;
            case "PREMIUM":
                configurePremium();
                break;
            default:
                System.out.println("Unknown type: " + typeCode);
        }

        model.Regenerate(null);
        model.Save();
    }

    private void configureStandard() throws jxthrowable {
        setParameter("THICKNESS", 2.0);
        setParameter("MATERIAL", "STEEL");
        suppressFeature("PREMIUM_FEATURES");
        unsuppressFeature("BASIC_FEATURES");
    }

    private void configureCompact() throws jxthrowable {
        setParameter("THICKNESS", 1.5);
        setParameter("MATERIAL", "ALUMINUM");
        suppressFeature("PREMIUM_FEATURES");
        suppressFeature("BASIC_FEATURES");
    }

    private void configurePremium() throws jxthrowable {
        setParameter("THICKNESS", 2.5);
        setParameter("MATERIAL", "TITANIUM");
        unsuppressFeature("PREMIUM_FEATURES");
        unsuppressFeature("BASIC_FEATURES");
    }

    private void setParameter(String name, Object value) {
        try {
            Parameter param = model.GetParam(name);

            ParamValue newVal;
            if (value instanceof Double) {
                newVal = pfcParameter.ParamValue_CreateDoubleParamValue(
                    (Double)value
                );
            } else if (value instanceof Integer) {
                newVal = pfcParameter.ParamValue_CreateIntParamValue(
                    (Integer)value
                );
            } else {
                newVal = pfcParameter.ParamValue_CreateStringParamValue(
                    value.toString()
                );
            }

            param.SetValue(newVal);
        } catch (jxthrowable x) {
            System.out.println("Parameter not found: " + name);
        }
    }

    private void suppressFeature(String patternName) {
        try {
            FeatureTree featTree = model.GetFeatureTree();
            Sequence<Feature> features = featTree.GetFeatures();

            for (int i = 0; i < features.GetMembersCount(); i++) {
                Feature f = features.GetMember(i);
                if (f.GetName().contains(patternName)) {
                    f.SetSuppressed(true);
                }
            }
        } catch (jxthrowable x) {
            System.out.println("Error suppressing features: " + x.getMessage());
        }
    }

    private void unsuppressFeature(String patternName) {
        try {
            FeatureTree featTree = model.GetFeatureTree();
            Sequence<Feature> features = featTree.GetFeatures();

            for (int i = 0; i < features.GetMembersCount(); i++) {
                Feature f = features.GetMember(i);
                if (f.GetName().contains(patternName)) {
                    f.SetSuppressed(false);
                }
            }
        } catch (jxthrowable x) {
            System.out.println("Error unsuppressing features: " + x.getMessage());
        }
    }
}

// Usage
ConfigurableModelGenerator config = new ConfigurableModelGenerator("base_part");
config.configureByType("PREMIUM");
// Model now configured for premium variant
```

## Pattern 5: Complete Error Handling Wrapper

**Use case:** Robust error handling and logging

```java
public abstract class JlinkOperation {

    protected Session session;
    protected Logger logger = LoggerFactory.getLogger(getClass());

    public JlinkOperation() throws JlinkException {
        try {
            this.session = pfcSession.GetCurrentSessionWithCompatibility(
                CreoCompatibility.C4Compatible
            );
        } catch (jxthrowable x) {
            throw new JlinkException("Failed to get Jlink session", x);
        }
    }

    public final void execute() throws JlinkException {
        logger.info("Starting Jlink operation: " + getClass().getSimpleName());

        try {
            beforeOperation();
            doOperation();
            afterOperation();

            logger.info("Operation completed successfully");

        } catch (JlinkException x) {
            logger.error("Operation failed: " + x.getMessage(), x);
            handleError(x);
            throw x;

        } catch (jxthrowable x) {
            String msg = "Jlink API error: " + x.getMessage();
            logger.error(msg, x);

            JlinkException wrapped = new JlinkException(msg, x);
            handleError(wrapped);
            throw wrapped;

        } catch (Exception x) {
            String msg = "Unexpected error: " + x.getMessage();
            logger.error(msg, x);

            JlinkException wrapped = new JlinkException(msg, x);
            handleError(wrapped);
            throw wrapped;

        } finally {
            cleanup();
        }
    }

    protected void beforeOperation() throws JlinkException {
        // Override for pre-operation setup
    }

    protected abstract void doOperation() throws jxthrowable;

    protected void afterOperation() throws JlinkException {
        // Override for post-operation tasks
    }

    protected void handleError(JlinkException x) {
        logger.warn("Error handling hook called");
        // Override for custom error recovery
    }

    protected void cleanup() {
        logger.debug("Cleanup phase");
        // Override for cleanup
    }

    public static class JlinkException extends Exception {
        private Throwable jlinkCause;

        public JlinkException(String msg) {
            super(msg);
        }

        public JlinkException(String msg, Throwable cause) {
            super(msg, cause);
            this.jlinkCause = cause;
        }

        public Throwable getJlinkCause() {
            return jlinkCause;
        }
    }
}

// Usage example
public class UpdatePartThickness extends JlinkOperation {

    private String modelName;
    private double newThickness;
    private Model model;

    public UpdatePartThickness(String modelName, double newThickness) {
        this.modelName = modelName;
        this.newThickness = newThickness;
    }

    @Override
    protected void beforeOperation() throws JlinkException {
        try {
            ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
                ModelType.MDL_PART, modelName, null
            );
            model = session.RetrieveModel(descr);
        } catch (jxthrowable x) {
            throw new JlinkException("Failed to retrieve model: " + modelName, x);
        }
    }

    @Override
    protected void doOperation() throws jxthrowable {
        Parameter thickness = model.GetParam("THICKNESS");
        thickness.SetValue(
            pfcParameter.ParamValue_CreateDoubleParamValue(newThickness)
        );
        model.Regenerate(null);
    }

    @Override
    protected void afterOperation() throws JlinkException {
        try {
            model.Save();
        } catch (jxthrowable x) {
            throw new JlinkException("Failed to save model", x);
        }
    }

    @Override
    protected void handleError(JlinkException x) {
        logger.error("Recovery: rolling back changes...");
        // Could reload model without saving, etc.
    }
}

// Execute with full error handling
try {
    UpdatePartThickness op = new UpdatePartThickness("my_part", 2.5);
    op.execute();
    System.out.println("Success!");
} catch (JlinkOperation.JlinkException x) {
    System.out.println("Operation failed: " + x.getMessage());
}
```

## Pattern 6: Performance-Optimized Batch Processing

```java
public class OptimizedBatchProcessor {

    private Session session;

    public OptimizedBatchProcessor() throws jxthrowable {
        this.session = pfcSession.GetCurrentSessionWithCompatibility(
            CreoCompatibility.C4Compatible
        );
    }

    public void processManyModels(List<String> modelNames,
                                  ModelProcessor processor) {

        long startTime = System.currentTimeMillis();

        // Suspend UI updates for entire batch
        try {
            session.UISetComputeMode(true);

            int success = 0;
            int failed = 0;

            for (String modelName : modelNames) {
                try {
                    Model model = retrieveModel(modelName);

                    // Let processor do work
                    processor.process(model);

                    // Minimal regeneration only if changed
                    if (processor.needsRegeneration()) {
                        model.Regenerate(null);
                    }

                    // Save if modified
                    if (model.GetModified()) {
                        model.Save();
                    }

                    success++;

                } catch (jxthrowable x) {
                    failed++;
                    // Log but continue
                }
            }

            // Final regeneration of all
            session.UISetComputeMode(false);

            long elapsed = System.currentTimeMillis() - startTime;
            System.out.println(String.format(
                "Batch complete: %d succeeded, %d failed in %dms",
                success, failed, elapsed
            ));

        } catch (jxthrowable x) {
            System.out.println("Batch error: " + x.getMessage());
        }
    }

    private Model retrieveModel(String name) throws jxthrowable {
        ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_PART, name, null
        );
        return session.RetrieveModel(descr);
    }

    public interface ModelProcessor {
        void process(Model model) throws jxthrowable;
        boolean needsRegeneration();
    }
}

// Usage
OptimizedBatchProcessor processor = new OptimizedBatchProcessor();
processor.processManyModels(
    Arrays.asList("part1", "part2", "part3"),
    new OptimizedBatchProcessor.ModelProcessor() {
        @Override
        public void process(Model model) throws jxthrowable {
            Parameter thickness = model.GetParam("THICKNESS");
            thickness.SetValue(
                pfcParameter.ParamValue_CreateDoubleParamValue(2.5)
            );
        }

        @Override
        public boolean needsRegeneration() {
            return true;
        }
    }
);
```

These patterns provide solid foundations for common Jlink tasks. Adapt them to your specific needs.
