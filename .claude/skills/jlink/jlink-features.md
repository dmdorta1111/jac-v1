# Jlink Feature Operations

Features are the building blocks of Creo models (extrusions, holes, rounds, etc.). Jlink provides complete feature creation and manipulation.

## Feature Types

**Common feature types:**
- `FeatureType.EXTRUDE` - Extrusion
- `FeatureType.HOLE` - Hole
- `FeatureType.POCKET` - Pocket/Cut
- `FeatureType.PAD` - Pad feature
- `FeatureType.FILLET` - Fillet/Round
- `FeatureType.CHAMFER` - Chamfer
- `FeatureType.SHELL` - Shell
- `FeatureType.DRAFT` - Draft
- `FeatureType.SWEEP` - Sweep
- `FeatureType.BLEND` - Blend
- `FeatureType.LOFT` - Loft
- `FeatureType.DATUM_PLANE` - Datum plane
- `FeatureType.DATUM_AXIS` - Datum axis
- `FeatureType.DATUM_POINT` - Datum point
- `FeatureType.COMPONENT` - Assembly component
- `FeatureType.COPY` - Copy feature
- `FeatureType.MIRROR` - Mirror feature

## Accessing Features

### Get Feature by Name
```java
try {
    Feature feat = model.GetFeatureByName("EXTRUDE_1");
    // Feature found
    String name = feat.GetName();
    FeatureType type = feat.GetFeatType();
} catch (jxthrowable x) {
    // Feature not found - handle error
}
```

### Iterate All Features (Creo 12.4 OTK)
```java
// Cast model to Solid to access features
if (model instanceof Solid) {
    Solid solid = (Solid) model;
    Features allFeatures = solid.ListFeaturesByType(true, null);

    if (allFeatures != null) {
        int count = allFeatures.getarraysize();
        for (int i = 0; i < count; i++) {
            Feature f = allFeatures.get(i);

            String name = f.GetName();
            FeatureType type = f.GetFeatType();

            // Check suppression via GetStatus() - NOT GetSuppressed()
            FeatureStatus status = f.GetStatus();
            boolean isSuppressed = (status == FeatureStatus.FEAT_SUPPRESSED);

            // Process feature
        }
    }
}
```

### Get Features by Type
```java
FeatureTree featTree = model.GetFeatureTree();
Sequence<Feature> allFeatures = featTree.GetFeatures();

List<Feature> holes = new ArrayList<>();
for (int i = 0; i < allFeatures.GetMembersCount(); i++) {
    Feature f = allFeatures.GetMember(i);
    if (f.GetFeatType() == FeatureType.HOLE) {
        holes.add(f);
    }
}

// Now process holes list
```

### Get Root Features (Parent Features)
```java
FeatureTree featTree = model.GetFeatureTree();
Sequence<Feature> rootFeats = featTree.GetRootFeatures();

for (int i = 0; i < rootFeats.GetMembersCount(); i++) {
    Feature rootFeat = rootFeats.GetMember(i);
    // Root features (no parent)
}
```

## Feature Properties

### Query Feature Information (Creo 12.4 OTK)
```java
Feature feat = solid.GetFeatureByName("EXTRUDE_1");

// Basic properties
String name = feat.GetName();
FeatureType type = feat.GetFeatType();
int featId = feat.GetId();

// State via GetStatus() - NOT GetSuppressed()/GetFailed()
FeatureStatus status = feat.GetStatus();
boolean isSuppressed = (status == FeatureStatus.FEAT_SUPPRESSED);
boolean isFailed = (status == FeatureStatus.FEAT_UNREGENERATED);

// Parent/child relationships
Features children = feat.ListChildren();
Features parents = feat.ListParents();

// Get dimensions via ListSubItems - NOT GetDimensions()
ModelItems dimItems = feat.ListSubItems(ModelItemType.ITEM_DIMENSION);
if (dimItems != null) {
    for (int i = 0; i < dimItems.getarraysize(); i++) {
        ModelItem item = dimItems.get(i);
        if (item instanceof BaseDimension) {
            BaseDimension dim = (BaseDimension) item;
            String dimName = dim.GetName();
            double dimValue = dim.GetDimValue();  // NOT GetValue()
        }
    }
}
```

### Feature Subtype (Detailed Type)
```java
Feature feat = model.GetFeatureByName("HOLE_1");

// Generic type
FeatureType type = feat.GetFeatType();  // HOLE

// Get specific hole type
try {
    HoleFeat holeFeat = (HoleFeat)feat;
    HoleType holeType = holeFeat.GetHoleType();
    // Standard, CounterBore, CounterSink, Straight Thread, etc.
} catch (ClassCastException e) {
    // Not a hole feature
}
```

## Creating Features

### Basic Feature Creation Pattern

```java
// 1. Create feature creation data
FeatureCreateData createData = pfcFeature.FeatureCreate_Create(
    FeatureType.EXTRUDE,      // Feature type
    ModelRef.CURRENT,         // Apply to current model
    "",                        // Feature name (Creo auto-generates)
    null, null                 // Additional parameters
);

// 2. Configure feature parameters
createData.SetIntParam("depth_type", 1);           // ONE_SIDED
createData.SetDoubleParam("depth_1", 25.4);       // Depth value
createData.SetBoolParam("flip", false);           // Direction

// 3. Create feature in model
Feature newFeat = model.CreateFeature(createData);

// 4. Verify creation
if (newFeat != null) {
    System.out.println("Created: " + newFeat.GetName());
}
```

### Extrude Creation Example
```java
// Create extrusion from sketch
FeatureCreateData extrudeData = pfcFeature.FeatureCreate_Create(
    FeatureType.EXTRUDE,
    ModelRef.CURRENT,
    "MY_EXTRUDE",
    null, null
);

// Set extrusion type: One-sided (1), Two-sided (2)
extrudeData.SetIntParam("depth_type", 1);

// Set depth
extrudeData.SetDoubleParam("depth_1", 10.0);

// Optional: Set direction flip
extrudeData.SetBoolParam("flip", false);

Feature extrude = model.CreateFeature(extrudeData);
```

### Hole Creation Example
```java
FeatureCreateData holeData = pfcFeature.FeatureCreate_Create(
    FeatureType.HOLE,
    ModelRef.CURRENT,
    "HOLE_1",
    null, null
);

// Hole type: Standard (0), CounterBore (1), CounterSink (2)
holeData.SetIntParam("hole_type", 0);

// Hole diameter
holeData.SetDoubleParam("diameter", 10.0);

// Hole depth
holeData.SetDoubleParam("depth", 15.0);

Feature hole = model.CreateFeature(holeData);
```

### Pocket (Cut) Creation
```java
FeatureCreateData pocketData = pfcFeature.FeatureCreate_Create(
    FeatureType.POCKET,
    ModelRef.CURRENT,
    "POCKET_1",
    null, null
);

// Pocket depth
pocketData.SetDoubleParam("depth", 5.0);

// Pocket type: Normal (0), Through All (1)
pocketData.SetIntParam("pocket_type", 0);

Feature pocket = model.CreateFeature(pocketData);
```

## Modifying Features

### Suppress Feature
```java
Feature feat = model.GetFeatureByName("EXTRUDE_1");
feat.SetSuppressed(true);  // Suppress

// Regenerate to apply
model.Regenerate(null);
```

### Rename Feature
```java
Feature feat = model.GetFeatureByName("EXTRUDE_1");
feat.SetName("BASE_EXTRUDE");

model.Regenerate(null);
```

### Delete Feature
```java
Feature feat = model.GetFeatureByName("EXTRA_FEATURE");

if (feat.IsDeletable()) {
    feat.Delete();
    model.Regenerate(null);
}
```

### Reorder Features
```java
Feature feat1 = model.GetFeatureByName("FEATURE_1");
Feature feat2 = model.GetFeatureByName("FEATURE_2");

// Move feat1 to after feat2
feat1.SetAfter(feat2);

model.Regenerate(null);
```

## Dimensions & Parameters

### Get Feature Dimensions (Creo 12.4 OTK)
```java
Feature feat = solid.GetFeatureByName("EXTRUDE_1");

// Use ListSubItems with ITEM_DIMENSION - NOT GetDimensions()
ModelItems dimItems = feat.ListSubItems(ModelItemType.ITEM_DIMENSION);

if (dimItems != null) {
    for (int i = 0; i < dimItems.getarraysize(); i++) {
        ModelItem item = dimItems.get(i);
        if (item instanceof BaseDimension) {
            BaseDimension dim = (BaseDimension) item;

            String dimName = dim.GetName();
            double dimValue = dim.GetDimValue();  // NOT GetValue()

            System.out.println(dimName + " = " + dimValue);
        }
    }
}
```

### Modify Feature Dimension (Creo 12.4 OTK)
```java
Feature feat = solid.GetFeatureByName("EXTRUDE_1");
ModelItems dimItems = feat.ListSubItems(ModelItemType.ITEM_DIMENSION);

if (dimItems != null) {
    for (int i = 0; i < dimItems.getarraysize(); i++) {
        ModelItem item = dimItems.get(i);
        if (item instanceof BaseDimension) {
            BaseDimension dim = (BaseDimension) item;
            if (dim.GetName().equals("DEPTH")) {
                dim.SetDimValue(20.0);  // Change depth to 20
                break;
            }
        }
    }
}

solid.Regenerate(null);
```

## Feature Dependencies

### Get Feature Children
```java
Feature parent = model.GetFeatureByName("EXTRUDE_1");
Sequence<Feature> children = parent.GetChildren();

System.out.println("Features dependent on " + parent.GetName() + ":");
for (int i = 0; i < children.GetMembersCount(); i++) {
    System.out.println("  - " + children.GetMember(i).GetName());
}
```

### Check Dependencies Before Delete
```java
Feature feat = model.GetFeatureByName("BASE_FEATURE");
Sequence<Feature> children = feat.GetChildren();

if (children.GetMembersCount() > 0) {
    System.out.println("Cannot delete - " + children.GetMembersCount()
        + " features depend on it");
} else {
    feat.Delete();
    model.Regenerate(null);
}
```

## Feature References

### Get Geometry References
```java
Feature feat = model.GetFeatureByName("HOLE_1");

// Get feature's geometry selections/references
// (specific to feature type - consult API docs)
```

### Update References After Geometry Change
```java
// After modifying sketch or base feature
Feature feat = model.GetFeatureByName("DEPENDENT_FEATURE");

// References may be invalid - regenerate to fix
try {
    model.Regenerate(null);
} catch (jxthrowable x) {
    System.out.println("Regeneration failed: " + x.getMessage());
    // May need to manually fix references
}
```

## Error Handling

### Feature Creation Errors
```java
try {
    FeatureCreateData createData = pfcFeature.FeatureCreate_Create(
        FeatureType.EXTRUDE,
        ModelRef.CURRENT,
        "",
        null, null
    );
    createData.SetDoubleParam("depth_1", 10.0);

    Feature newFeat = model.CreateFeature(createData);
    if (newFeat == null) {
        System.out.println("Feature creation returned null");
    }
} catch (jxthrowable x) {
    System.out.println("Error creating feature: " + x.getMessage());
}
```

### Feature Modification Errors
```java
try {
    Feature feat = model.GetFeatureByName("EXTRUDE_1");
    feat.SetName("NEW_NAME");
    model.Regenerate(null);
} catch (jxthrowable x) {
    if (x.getMessage().contains("not found")) {
        System.out.println("Feature doesn't exist");
    } else {
        System.out.println("Modification error: " + x.getMessage());
    }
}
```

## Best Practices

1. **Always regenerate after changes** - `model.Regenerate(null)` after feature creation/modification
2. **Validate feature existence** - Use try-catch when accessing features by name
3. **Check deletability before delete** - Use `IsDeletable()` first
4. **Handle feature dependencies** - Check `GetChildren()` before deleting
5. **Update references after regen** - Geometry handles become invalid
6. **Use specific feature types** - Cast to HoleFeat, ExtrudeFeat for type-specific properties
7. **Log feature operations** - Essential for debugging complex models
8. **Test dimension access** - Not all features have dimensions
9. **Verify feature creation** - Check for null returns
10. **Suppress instead of delete** - More conservative, easier to recover
