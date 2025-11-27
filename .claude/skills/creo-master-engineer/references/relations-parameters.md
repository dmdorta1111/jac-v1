# Relations and Parameters Reference

## Parameters

### Parameter Types

| Type | Description | Example |
|------|-------------|---------|
| Integer | Whole numbers | `COUNT = 5` |
| Real | Decimal numbers | `LENGTH = 25.4` |
| String | Text values | `PART_NUMBER = "ABC-123"` |
| Boolean | Yes/No | `ACTIVE = YES` |
| Note | Multi-line text | Description fields |

### System Parameters

| Parameter | Description |
|-----------|-------------|
| `PTC_COMMON_NAME` | Display name |
| `PTC_MATERIAL_NAME` | Assigned material |
| `DESCRIPTION` | Part description |
| `MODELED_BY` | Designer name |
| `PRO_MP_MASS` | Calculated mass |
| `PRO_MP_VOLUME` | Calculated volume |
| `PRO_MP_DENSITY` | Material density |

### Creating Parameters

1. Tools > Parameters
2. Add new parameter row
3. Set name, type, value
4. Optional: Set designation status

### Designating Parameters

Designated parameters appear in:
- BOM tables
- Windchill attributes
- External systems

## Relations

### Accessing Relations

- Tools > Relations (model level)
- Right-click feature > Edit Relations (feature level)

### Relation Syntax

Basic assignment:
```
d0 = 25.0
d1 = d0 * 2
parameter_name = d5 + 10
```

### Dimension Naming

| Format | Description |
|--------|-------------|
| `d#` | Dimension by ID number |
| `d#:fid_#` | Dimension in specific feature |
| `d#:fid_name` | Dimension by feature name |
| `dim_name` | Named dimension |

### Operators

| Operator | Description |
|----------|-------------|
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `^` | Exponentiation |
| `( )` | Grouping |

### Comparison Operators

| Operator | Meaning |
|----------|---------|
| `==` | Equal to |
| `!=` | Not equal to |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |

### Mathematical Functions

| Function | Description |
|----------|-------------|
| `sin(x)` | Sine (x in degrees) |
| `cos(x)` | Cosine |
| `tan(x)` | Tangent |
| `asin(x)` | Arc sine |
| `acos(x)` | Arc cosine |
| `atan(x)` | Arc tangent |
| `sqrt(x)` | Square root |
| `abs(x)` | Absolute value |
| `log(x)` | Natural logarithm |
| `exp(x)` | Exponential (e^x) |
| `ceil(x)` | Round up |
| `floor(x)` | Round down |
| `min(a,b)` | Minimum value |
| `max(a,b)` | Maximum value |

### Conditional Relations

If-then-else structure:
```
IF condition
  statements
ENDIF

IF condition
  statements
ELSE
  statements
ENDIF

IF condition1
  statements
ELIF condition2
  statements
ELSE
  statements
ENDIF
```

### Examples

Simple proportional relation:
```
/* Hole diameter is 10% of width */
d5 = d0 * 0.10
```

Conditional feature control:
```
IF LENGTH > 100
  NUM_RIBS = 4
ELSE
  NUM_RIBS = 2
ENDIF
```

Assembly-level relation:
```
/* Reference dimension from component */
d0 = d5:0:BRACKET.PRT + OFFSET_PARAM
```

### Relation Comments

```
/* This is a comment block
   that spans multiple lines */

d0 = 25.0 /* inline comment */
```

## Family Tables

### Family Table Concepts

| Term | Description |
|------|-------------|
| Generic | Original (master) model |
| Instance | Variation of generic |
| Table-driven | Values from family table |
| Common | Same value across instances |

### Adding Items to Family Table

Tools > Family Table > Add Item

| Item Type | What Can Vary |
|-----------|---------------|
| Dimension | Numeric values |
| Parameter | Parameter values |
| Feature | Suppressed/Resumed |
| Component | Included/Excluded |
| Member | Reference other instances |
| Group | Feature group state |

### Family Table Syntax

| Syntax | Meaning |
|--------|---------|
| `Y` | Feature/component active |
| `N` | Feature/component suppressed |
| `*` | Use generic value |
| Numeric | Specific value |

### Instance Names

- Must be unique within table
- Cannot contain spaces or special characters
- Can include parameters for auto-naming

### Verifying Instances

Tools > Family Table > Verify
- Check all instances regenerate
- Identify failed instances
- Preview instance geometry

## Pattern Tables

Use pattern tables for:
- Non-uniform feature spacing
- Irregular arrays
- Controlled feature variations

Create: Pattern > Table option

## External Relations

### Referencing Other Models

In assembly:
```
d0:5:PART_NAME.PRT = d0:3:OTHER_PART.PRT + 5
```

Format: `dimension:feature_id:component_name`

### Session ID

For non-unique component names:
```
d0:5:PART_NAME.PRT<session_id>
```

## Configuration Options

| Option | Description |
|--------|-------------|
| `relation_file_extension` | Default relation file type |
| `enable_advance_relation` | Advanced relation features |
| `relation_tool_mapkeys` | Enable mapkey in relations |
| `pro_relation_editor` | External relation editor |
| `mass_property_calculate` | Auto-calculate mass props |

## Relations Best Practices

1. **Name dimensions** - Use meaningful names for clarity
2. **Comment relations** - Document purpose and intent
3. **Group related relations** - Organize by function
4. **Use parameters** - Create named parameters for key values
5. **Test edge cases** - Verify relations at extreme values
6. **Avoid circular references** - Relations must be sequential
7. **Feature-level when possible** - Keep relations with features
8. **Validate regeneration** - Check model updates correctly
9. **Document in model** - Add notes for future reference
10. **Version control** - Track relation changes

## Troubleshooting Relations

| Issue | Cause | Solution |
|-------|-------|----------|
| Circular reference | Dimension references itself | Restructure relation chain |
| Invalid dimension | Dimension renamed/deleted | Update relation reference |
| Feature fails | Relation produces invalid value | Check mathematical logic |
| Instance fails | Table value incompatible | Verify instance values |
| Slow regeneration | Complex relation chains | Simplify or use parameters |
