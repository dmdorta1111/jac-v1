# Jlink Parameter Operations

Parameters are named dimensions/variables in Creo models. They drive design changes when modified.

## Parameter Basics

### Get Parameter by Name
```java
try {
    Parameter param = model.GetParam("THICKNESS");

    // Get parameter properties
    String name = param.GetName();
    ParamValue value = param.GetValue();
    String type = param.GetType().toString();
} catch (jxthrowable x) {
    System.out.println("Parameter not found: THICKNESS");
}
```

### Parameter Types
```java
Parameter param = model.GetParam("DIMENSION_VALUE");

// Check type
ParamType paramType = param.GetType();

// Common types:
// ParamType.DOUBLE - Numeric dimension (most common)
// ParamType.INTEGER - Whole numbers
// ParamType.STRING - Text/name parameters
// ParamType.BOOL - True/false parameters
// ParamType.SYMBOL - Symbolic dimension references
```

### Get Parameter Value
```java
Parameter param = model.GetParam("THICKNESS");
ParamValue value = param.GetValue();

// Convert based on type
if (param.GetType() == ParamType.DOUBLE) {
    double thickness = value.GetDoubleValue();
} else if (param.GetType() == ParamType.INTEGER) {
    int count = value.GetIntValue();
} else if (param.GetType() == ParamType.STRING) {
    String text = value.GetStringValue();
} else if (param.GetType() == ParamType.BOOL) {
    boolean flag = value.GetBoolValue();
}
```

## Listing Parameters

### Get All Model Parameters (Creo 12.4 OTK)
```java
// Model implements ParameterOwner - use ListParams() directly
Parameters allParams = model.ListParams();

if (allParams != null) {
    System.out.println("Model Parameters:");
    int count = allParams.getarraysize();

    for (int i = 0; i < count; i++) {
        Parameter p = allParams.get(i);

        String name = p.GetName();
        ParamValue val = p.GetValue();

        // Try to get value based on type
        String valueStr = "?";
        try {
            valueStr = Double.toString(val.GetDoubleValue());
        } catch (Exception e1) {
            try {
                valueStr = val.GetStringValue();
            } catch (Exception e2) {
                try {
                    valueStr = Integer.toString(val.GetIntValue());
                } catch (Exception e3) {
                    valueStr = val.toString();
                }
            }
        }

        System.out.println("  " + name + " = " + valueStr);
    }
}
```

### Filter Parameters by Type
```java
ParameterTable paramTable = model.GetParameters();
Sequence<Parameter> allParams = paramTable.GetParams();

List<Parameter> numericParams = new ArrayList<>();
for (int i = 0; i < allParams.GetMembersCount(); i++) {
    Parameter p = allParams.GetMember(i);
    if (p.GetType() == ParamType.DOUBLE ||
        p.GetType() == ParamType.INTEGER) {
        numericParams.add(p);
    }
}

// Now process numeric parameters
```

## Setting Parameters

### Modify Parameter Value
```java
// Get parameter
Parameter param = model.GetParam("THICKNESS");

// Create new value
ParamValue newVal = pfcParameter.ParamValue_CreateDoubleParamValue(2.5);

// Set value
param.SetValue(newVal);

// Regenerate to apply
model.Regenerate(null);
```

### Set Different Parameter Types
```java
// Double
Parameter doubleParam = model.GetParam("DEPTH");
doubleParam.SetValue(
    pfcParameter.ParamValue_CreateDoubleParamValue(10.5)
);

// Integer
Parameter intParam = model.GetParam("NUM_HOLES");
intParam.SetValue(
    pfcParameter.ParamValue_CreateIntParamValue(4)
);

// String
Parameter strParam = model.GetParam("PART_NAME");
strParam.SetValue(
    pfcParameter.ParamValue_CreateStringParamValue("MY_PART_001")
);

// Boolean
Parameter boolParam = model.GetParam("IS_MIRROR");
boolParam.SetValue(
    pfcParameter.ParamValue_CreateBoolParamValue(true)
);

model.Regenerate(null);
```

### Batch Parameter Updates
```java
// Map of parameter changes
Map<String, Double> updates = new HashMap<>();
updates.put("THICKNESS", 2.5);
updates.put("WIDTH", 100.0);
updates.put("HEIGHT", 50.0);

for (Map.Entry<String, Double> entry : updates.entrySet()) {
    try {
        Parameter param = model.GetParam(entry.getKey());
        ParamValue newVal = pfcParameter.ParamValue_CreateDoubleParamValue(
            entry.getValue()
        );
        param.SetValue(newVal);
    } catch (jxthrowable x) {
        System.out.println("Could not update " + entry.getKey());
    }
}

// Single regeneration after all updates
model.Regenerate(null);
```

## Creating Parameters

### Add New Parameter to Model
```java
// Create parameter object
Parameter newParam = pfcParameter.Parameter_Create(
    "MY_NEW_PARAM",
    ParamType.DOUBLE,
    pfcParameter.ParamValue_CreateDoubleParamValue(5.0)
);

// Add to model
ParameterTable paramTable = model.GetParameters();
paramTable.AddParam(newParam);

// Now available for use
Parameter retrieved = model.GetParam("MY_NEW_PARAM");
```

### Create with Description
```java
Parameter param = pfcParameter.Parameter_Create(
    "THICKNESS",
    ParamType.DOUBLE,
    pfcParameter.ParamValue_CreateDoubleParamValue(2.5)
);

// Some versions support description
// param.SetDescription("Sheet thickness in mm");

ParameterTable paramTable = model.GetParameters();
paramTable.AddParam(param);
```

## Parameter Validation

### Safe Parameter Access
```java
public Double getParameterValue(Model model, String paramName) {
    try {
        Parameter param = model.GetParam(paramName);

        // Validate type
        if (param.GetType() != ParamType.DOUBLE) {
            System.out.println(paramName + " is not numeric");
            return null;
        }

        // Get value
        ParamValue val = param.GetValue();
        double value = val.GetDoubleValue();

        // Validate range
        if (value < 0) {
            System.out.println(paramName + " is negative: " + value);
            return null;
        }

        return value;

    } catch (jxthrowable x) {
        System.out.println("Parameter not found: " + paramName);
        return null;
    }
}
```

### Pre-Update Validation
```java
public boolean setParameterSafe(Model model, String paramName,
                               double newValue) throws jxthrowable {
    // Parameter exists?
    try {
        Parameter param = model.GetParam(paramName);

        // Is it numeric?
        if (param.GetType() != ParamType.DOUBLE) {
            System.out.println(paramName + " is not numeric");
            return false;
        }

        // Value in valid range?
        if (newValue <= 0) {
            System.out.println("Value must be positive");
            return false;
        }

        // Apply change
        param.SetValue(
            pfcParameter.ParamValue_CreateDoubleParamValue(newValue)
        );
        return true;

    } catch (jxthrowable x) {
        System.out.println("Parameter not found: " + paramName);
        return false;
    }
}
```

## Parameter Units

### Get/Set Parameter with Units
```java
Parameter param = model.GetParam("THICKNESS");

// Get value with unit context
ParamValue val = param.GetValue();
double thickness = val.GetDoubleValue();

// Units are stored in model settings
// Convert as needed based on model unit system
String unitSystem = model.GetUnitsystem();  // "mm", "inch", etc.

// Set scaled value (if different units)
if ("inch".equals(unitSystem)) {
    // Creo expects inches, convert from mm
    double valueInches = thickness / 25.4;
    param.SetValue(
        pfcParameter.ParamValue_CreateDoubleParamValue(valueInches)
    );
}
```

## Parameter Relations

### Check if Parameter Has Relations
```java
Parameter param = model.GetParam("CALCULATED_VALUE");

// Some parameters may be driven by relations
// (specific API varies by Creo version)
```

### Get Parameters Referenced by Relations
```java
// Get all parameters
ParameterTable paramTable = model.GetParameters();
Sequence<Parameter> allParams = paramTable.GetParams();

// Check which are independent vs. relation-driven
List<Parameter> independentParams = new ArrayList<>();
for (int i = 0; i < allParams.GetMembersCount(); i++) {
    Parameter p = allParams.GetMember(i);

    // If can set value directly, it's independent
    // (relation-driven parameters may reject changes)
    try {
        ParamValue current = p.GetValue();
        // Can access - likely independent
        independentParams.add(p);
    } catch (jxthrowable x) {
        // May be relation-driven
    }
}
```

## Dimension vs. Parameter

### Dimension (Feature-specific)
```java
Feature feat = model.GetFeatureByName("EXTRUDE_1");
Sequence<Dimension> dims = feat.GetDimensions();

// Dimensions are part of features
// Access via feature -> dimension -> parameter (if parameterized)
```

### Parameter (Model-wide)
```java
// Parameters exist at model level
Parameter param = model.GetParam("THICKNESS");

// Can be referenced by multiple features
// Can drive relations and configurations
```

### Link Dimension to Parameter
```java
// Typically done in Creo UI
// Via Jlink: modify dimension values which may have parameter references

Feature feat = model.GetFeatureByName("EXTRUDE_1");
Sequence<Dimension> dims = feat.GetDimensions();

for (int i = 0; i < dims.GetMembersCount(); i++) {
    Dimension dim = dims.GetMember(i);

    // Check if dimension has parameter
    // (varies by Creo version)
    // param = dim.GetParameter();
}
```

## Error Handling

### Parameter Access Errors
```java
try {
    Parameter param = model.GetParam("NONEXISTENT");
    // Will throw jxthrowable
} catch (jxthrowable x) {
    if (x.getMessage().contains("not found")) {
        System.out.println("Parameter doesn't exist");
    } else {
        System.out.println("Error: " + x.getMessage());
    }
}
```

### Parameter Type Mismatch
```java
try {
    Parameter param = model.GetParam("TEXT_PARAM");

    // Assume it's double (WRONG!)
    double value = param.GetValue().GetDoubleValue();

} catch (jxthrowable x) {
    // Will fail if param is string type
    System.out.println("Type mismatch: " + x.getMessage());
}
```

### Safe Type Conversion
```java
Parameter param = model.GetParam("THICKNESS");

double value;
try {
    if (param.GetType() == ParamType.DOUBLE) {
        value = param.GetValue().GetDoubleValue();
    } else if (param.GetType() == ParamType.INTEGER) {
        value = (double) param.GetValue().GetIntValue();
    } else {
        throw new Exception("Parameter is not numeric");
    }
} catch (Exception e) {
    System.out.println("Conversion error: " + e.getMessage());
    value = 0.0;  // Default
}
```

## Performance Patterns

### Cache Parameter Values
```java
// Load all parameters once
Map<String, Parameter> paramCache = new HashMap<>();
ParameterTable paramTable = model.GetParameters();
Sequence<Parameter> allParams = paramTable.GetParams();

for (int i = 0; i < allParams.GetMembersCount(); i++) {
    Parameter p = allParams.GetMember(i);
    paramCache.put(p.GetName(), p);
}

// Reuse cached parameters
Parameter thickness = paramCache.get("THICKNESS");
Parameter width = paramCache.get("WIDTH");
```

### Batch Operations
```java
// Disable regeneration during batch updates
// (if API supports)
Session session = pfcSession.GetCurrentSessionWithCompatibility(
    CreoCompatibility.C4Compatible
);
session.UISetComputeMode(true);  // Suspend UI/regen

// Update many parameters
for (int i = 0; i < 100; i++) {
    Parameter param = model.GetParam("PARAM_" + i);
    param.SetValue(
        pfcParameter.ParamValue_CreateDoubleParamValue(i * 1.5)
    );
}

// Single regeneration at end
session.UISetComputeMode(false);
model.Regenerate(null);
```

## Best Practices

1. **Always use try-catch** - Parameter access throws jxthrowable
2. **Validate parameter type** before accessing value
3. **Regenerate after changes** - `model.Regenerate(null)` to apply updates
4. **Cache parameters for reuse** - Avoid repeated GetParam() calls
5. **Check parameter existence** before setting
6. **Use safe type conversion** - Check type before calling GetDoubleValue() etc.
7. **Batch updates** - Group parameter changes, regenerate once
8. **Log parameter operations** - Helpful for debugging
9. **Document parameter names** - Easy to change in Creo UI
10. **Validate values** - Check ranges before setting
