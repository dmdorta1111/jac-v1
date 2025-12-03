# Jlink Assembly Operations

Assemblies combine multiple parts and manage their relationships via constraints. Jlink provides comprehensive assembly automation.

## Assembly Basics

### Create Assembly
```java
// Create new assembly
ModelDescriptor asmDescr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_ASSEMBLY,
    "my_assembly",
    null  // Save to working directory
);

Model assembly = session.CreateModel(asmDescr, null);

// Assembly is now created and active
assembly.Save();
```

### Open Existing Assembly
```java
ModelDescriptor asmDescr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_ASSEMBLY,
    "my_assembly",
    null
);

Model assembly = session.RetrieveModel(asmDescr);
```

## Adding Components

### Add Component to Assembly
```java
// Define component to add
ModelDescriptor compDescr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART,
    "component_part",
    null
);

// Create component feature
FeatureCreateData compData = pfcFeature.FeatureCreate_Create(
    FeatureType.COMPONENT,
    ModelRef.CURRENT,
    "COMP_001",
    compDescr,
    null
);

Feature compFeature = assembly.CreateFeature(compData);

// Component added to assembly
assembly.Regenerate(null);
```

### Add Multiple Components in Sequence
```java
// First component (base)
ModelDescriptor comp1Descr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART, "base_part", null
);
FeatureCreateData comp1Data = pfcFeature.FeatureCreate_Create(
    FeatureType.COMPONENT, ModelRef.CURRENT, "BASE", comp1Descr, null
);
Feature comp1 = assembly.CreateFeature(comp1Data);

// Second component
ModelDescriptor comp2Descr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART, "side_bracket", null
);
FeatureCreateData comp2Data = pfcFeature.FeatureCreate_Create(
    FeatureType.COMPONENT, ModelRef.CURRENT, "BRACKET", comp2Descr, null
);
Feature comp2 = assembly.CreateFeature(comp2Data);

assembly.Regenerate(null);
```

### Add Component with Position Offset
```java
ModelDescriptor compDescr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART, "part", null
);

FeatureCreateData compData = pfcFeature.FeatureCreate_Create(
    FeatureType.COMPONENT,
    ModelRef.CURRENT,
    "COMPONENT",
    compDescr,
    null
);

// Set position offset (if API supports)
// compData.SetDoubleParam("offset_x", 50.0);
// compData.SetDoubleParam("offset_y", 0.0);
// compData.SetDoubleParam("offset_z", 0.0);

Feature comp = assembly.CreateFeature(compData);
```

## Working with Components

### List All Components (Creo 12.4 OTK)
```java
// Cast to Solid to access features
if (assembly instanceof Solid) {
    Solid solid = (Solid) assembly;

    // Use ListFeaturesByType with FEATTYPE_COMPONENT
    Features compFeatures = solid.ListFeaturesByType(true, FeatureType.FEATTYPE_COMPONENT);

    if (compFeatures != null) {
        int count = compFeatures.getarraysize();
        System.out.println("Assembly has " + count + " components");

        for (int i = 0; i < count; i++) {
            Feature f = compFeatures.get(i);
            System.out.println("  - " + f.GetName());
        }
    }
}
```

### Get Component Information (Creo 12.4 OTK)
```java
Solid solid = (Solid) assembly;
Feature comp = solid.GetFeatureByName("COMP_001");

// Cast to component feature
if (comp instanceof ComponentFeat) {
    ComponentFeat compFeat = (ComponentFeat) comp;

    // Get component model descriptor - use GetModelDescr() NOT GetModelDescriptor()
    ModelDescriptor compDescr = compFeat.GetModelDescr();

    String compName = compDescr.GetFullName();  // NOT GetName()
    ModelType compType = compDescr.GetType();

    // Open component model
    Model compModel = session.RetrieveModel(compDescr);
}
```

### Get Component Location
```java
// Component position can be queried
// (specific API varies by Creo version)

ComponentFeat compFeat = (ComponentFeat)assembly.GetFeatureByName("COMP_001");

// Get orientation/position info
// (not directly available in basic Jlink - typically via measure tools)
```

## Constraints

### Constraint Types
```
ConstraintType.MATE - Faces coincident
ConstraintType.ALIGN - Faces parallel
ConstraintType.INSERT - Axis aligned, offset
ConstraintType.ORIENT - Surfaces parallel or perpendicular
ConstraintType.TANGENT - Surfaces tangent
ConstraintType.DISTANCE - Fixed distance between surfaces
ConstraintType.FIX - Component fixed in place
ConstraintType.CDISTANCE - Coaxial distance constraint
```

### Apply Mate Constraint
```java
// Define two surface references for mating
// (typically from geometric selection)

ModelDescriptor ref1Descr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART, "part1", null
);
ModelDescriptor ref2Descr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART, "part2", null
);

// Create mate constraint
try {
    Constraint mateConstraint = pfcConstraint.Constraint_CreateMateConstraint(
        null,  // Reference 1 (surface)
        null   // Reference 2 (surface)
    );

    assembly.AddConstraint(mateConstraint);
    assembly.Regenerate(null);

} catch (jxthrowable x) {
    System.out.println("Constraint failed: " + x.getMessage());
}
```

### Apply Distance Constraint
```java
try {
    Constraint distConstraint = pfcConstraint.Constraint_CreateDistanceConstraint(
        null,      // Reference 1
        null,      // Reference 2
        10.0       // Distance value
    );

    assembly.AddConstraint(distConstraint);
    assembly.Regenerate(null);

} catch (jxthrowable x) {
    System.out.println("Distance constraint failed");
}
```

### Apply Fix Constraint
```java
// Fix component in place (no movement)
try {
    Feature comp = assembly.GetFeatureByName("BASE_PART");
    ComponentFeat compFeat = (ComponentFeat)comp;

    Constraint fixConstraint = pfcConstraint.Constraint_CreateFixConstraint(
        compFeat,
        null
    );

    assembly.AddConstraint(fixConstraint);
    assembly.Regenerate(null);

} catch (jxthrowable x) {
    System.out.println("Fix constraint failed");
}
```

## Assembly Properties

### Get Assembly Information (Creo 12.4 OTK)
```java
Model assembly = session.RetrieveModel(asmDescr);

// Basic properties - use GetFullName() NOT GetModelName()
String name = assembly.GetFullName();
ModelType type = assembly.GetType();

// Assembly statistics
FeatureTree featTree = assembly.GetFeatureTree();
Sequence<Feature> features = featTree.GetFeatures();

int numComponents = 0;
int numConstraints = 0;

for (int i = 0; i < features.GetMembersCount(); i++) {
    Feature f = features.GetMember(i);
    if (f.GetFeatType() == FeatureType.COMPONENT) {
        numComponents++;
    } else if (f.GetFeatType() == FeatureType.CONSTRAINT) {
        numConstraints++;
    }
}

System.out.println(name + ": " + numComponents + " components, "
    + numConstraints + " constraints");
```

### Check Assembly Status
```java
Model assembly = session.RetrieveModel(asmDescr);

// Is assembly fully constrained?
boolean modified = assembly.GetModified();

// Try regeneration to check for errors
try {
    assembly.Regenerate(null);
    System.out.println("Assembly is valid");
} catch (jxthrowable x) {
    System.out.println("Assembly has errors: " + x.getMessage());
}
```

## Component Iteration Pattern

```java
public void processAllComponents(Model assembly) throws jxthrowable {
    FeatureTree featTree = assembly.GetFeatureTree();
    Sequence<Feature> features = featTree.GetFeatures();

    for (int i = 0; i < features.GetMembersCount(); i++) {
        Feature f = features.GetMember(i);

        if (f.GetFeatType() == FeatureType.COMPONENT) {
            ComponentFeat compFeat = (ComponentFeat)f;

            // Get component info
            String compName = f.GetName();
            ModelDescriptor compDescr = compFeat.GetModelDescriptor();
            String partName = compDescr.GetName();

            System.out.println("Processing: " + compName + " (" + partName + ")");

            // Get component model
            Model compModel = session.RetrieveModel(compDescr);

            // Modify component parameters
            try {
                Parameter param = compModel.GetParam("THICKNESS");
                if (param != null) {
                    double thickness = param.GetValue().GetDoubleValue();
                    System.out.println("  Thickness: " + thickness);
                }
            } catch (jxthrowable x) {
                // Parameter not found
            }
        }
    }
}
```

## Subassembly Access

### Open Subassembly
```java
// Get component that is itself an assembly
Feature subAsmComp = assembly.GetFeatureByName("SUBASSEMBLY_COMP");
ComponentFeat compFeat = (ComponentFeat)subAsmComp;

ModelDescriptor subAsmDescr = compFeat.GetModelDescriptor();

// Verify it's an assembly
if (subAsmDescr.GetType() == ModelType.MDL_ASSEMBLY) {
    Model subAsm = session.RetrieveModel(subAsmDescr);

    // Now can work with subassembly
    FeatureTree subFeatTree = subAsm.GetFeatureTree();
}
```

### Recursively Process Assembly Tree
```java
public void processAssemblyTree(Model model, int level) throws jxthrowable {
    String indent = String.join("", Collections.nCopies(level * 2, " "));

    FeatureTree featTree = model.GetFeatureTree();
    Sequence<Feature> features = featTree.GetFeatures();

    for (int i = 0; i < features.GetMembersCount(); i++) {
        Feature f = features.GetMember(i);

        if (f.GetFeatType() == FeatureType.COMPONENT) {
            ComponentFeat compFeat = (ComponentFeat)f;
            ModelDescriptor compDescr = compFeat.GetModelDescriptor();

            System.out.println(indent + compDescr.GetName());

            // If subassembly, recurse
            if (compDescr.GetType() == ModelType.MDL_ASSEMBLY) {
                Model subAsm = session.RetrieveModel(compDescr);
                processAssemblyTree(subAsm, level + 1);
            }
        }
    }
}
```

## Error Handling

### Component Creation Error
```java
try {
    ModelDescriptor compDescr = pfcModel.ModelDescriptor_Create(
        ModelType.MDL_PART,
        "nonexistent_part",
        null
    );

    FeatureCreateData compData = pfcFeature.FeatureCreate_Create(
        FeatureType.COMPONENT,
        ModelRef.CURRENT,
        "COMP",
        compDescr,
        null
    );

    Feature comp = assembly.CreateFeature(compData);
    assembly.Regenerate(null);

} catch (jxthrowable x) {
    if (x.getMessage().contains("not found")) {
        System.out.println("Component part doesn't exist");
    } else if (x.getMessage().contains("already open")) {
        System.out.println("Part is already in assembly");
    } else {
        System.out.println("Error: " + x.getMessage());
    }
}
```

### Constraint Application Error
```java
try {
    Constraint mateConstraint = pfcConstraint.Constraint_CreateMateConstraint(
        ref1, ref2
    );
    assembly.AddConstraint(mateConstraint);
    assembly.Regenerate(null);

} catch (jxthrowable x) {
    if (x.getMessage().contains("underconstrained")) {
        System.out.println("Cannot apply constraint - geometry mismatch");
    } else {
        System.out.println("Constraint error: " + x.getMessage());
    }
}
```

## Performance Patterns

### Batch Assembly Creation
```java
Session session = pfcSession.GetCurrentSessionWithCompatibility(
    CreoCompatibility.C4Compatible
);

// Suspend UI updates during batch creation
session.UISetComputeMode(true);

Model assembly = session.CreateModel(
    pfcModel.ModelDescriptor_Create(
        ModelType.MDL_ASSEMBLY, "batch_asm", null
    ),
    null
);

// Add many components
for (int i = 0; i < 50; i++) {
    ModelDescriptor compDescr = pfcModel.ModelDescriptor_Create(
        ModelType.MDL_PART, "component_" + i, null
    );

    FeatureCreateData compData = pfcFeature.FeatureCreate_Create(
        FeatureType.COMPONENT,
        ModelRef.CURRENT,
        "COMP_" + i,
        compDescr,
        null
    );

    assembly.CreateFeature(compData);
}

// Resume UI and single regeneration
session.UISetComputeMode(false);
assembly.Regenerate(null);
assembly.Save();
```

## Best Practices

1. **Always regenerate after changes** - Assembly constraints need regeneration
2. **Validate component exists** - Try-catch when adding components
3. **Check assembly status** - Use GetModified() to detect changes
4. **Handle constraint conflicts** - Some constraints may conflict
5. **Process components recursively** - Subassemblies need special handling
6. **Batch operations** - Use UISetComputeMode for multiple changes
7. **Log component operations** - Essential for debugging assemblies
8. **Verify constraints apply** - Check for underconstrained/overconstrained
9. **Test component location** - May not match expectations initially
10. **Save incrementally** - Don't lose work in large assemblies
