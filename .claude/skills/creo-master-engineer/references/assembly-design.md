# Assembly Design Reference

## Assembly Modes

| Mode | Description |
|------|-------------|
| Assembly | Standard assembly design environment |
| Component | Edit individual parts in assembly context |
| Skeleton | Create skeleton models for top-down design |

## Placement Constraints

### User-Defined Constraints

| Constraint | Description | References |
|------------|-------------|------------|
| Coincident | Aligns references (surfaces, edges, points, axes) | Point-point, plane-plane, axis-axis |
| Distance | Offsets component from assembly reference | Any pair with offset value |
| Angle Offset | Positions at specified angle | Line-line, line-plane, plane-plane |
| Parallel | Orients parallel to reference | Lines or planes |
| Normal | Perpendicular orientation | Lines or planes |
| Coplanar | Edges/axes in same plane | Line-line only |
| Centered | Centers conical/spherical surfaces | Cone-cone, sphere-sphere, torus-torus |
| Tangent | Contact at tangent point | Surface-surface |
| Fix | Locks current position | No references needed |
| Default | Aligns to assembly origin | Csys-csys |

### Predefined Constraint Sets (Connections)

| Connection | DOF | Description |
|------------|-----|-------------|
| Rigid | 0 | Fixed relative position |
| Pin | 1 | Rotation about axis |
| Slider | 1 | Translation along axis |
| Cylinder | 2 | Rotation + translation along axis |
| Planar | 3 | Translation + rotation in plane |
| Ball | 3 | 360° rotation, fixed point |
| Bearing | 4 | Ball + slider combined |
| General | Variable | Custom 1-2 constraints |
| 6DOF | 6 | Free movement (mechanism only) |
| Weld | 0 | Fixed at csys alignment |
| Gimbal | 3 | Free rotation, centered |
| Slot | 4 | Point on trajectory |

## Assembly Workflow

### Adding Components

1. **Assemble command**: Model > Component > Assemble
2. **Select component** from file browser or drag from folder
3. **Position component** using drag handles or constraints
4. **Define constraints** to fully constrain (no DOF remaining)
5. **Accept placement** when status shows "Fully Constrained"

### Constraint Status

| Status | Color | Meaning |
|--------|-------|---------|
| Fully Constrained | Green | All DOF removed |
| Partially Constrained | Yellow | Some DOF remain |
| Packaged | Red | No constraints defined |
| Over Constrained | Red | Conflicting constraints |

### Component Operations

| Operation | Purpose |
|-----------|---------|
| Pattern | Create component arrays (dimension, reference, fill, table) |
| Mirror | Create symmetric component placement |
| Replace | Swap component with different model |
| Restructure | Move component to different subassembly |
| Copy | Duplicate component with same/new constraints |
| Flexible | Allow subassembly articulation |

## Bill of Materials (BOM)

### BOM Parameters

| Parameter | Description |
|-----------|-------------|
| PTC_COMMON_NAME | Display name in BOM |
| DESCRIPTION | Part description |
| PTC_MATERIAL_NAME | Assigned material |
| MODELED_BY | Designer name |
| COST | Part cost value |

### Repeat Region Commands

In drawings, use repeat regions for automatic BOM tables:
- `&asm.mbr.name` - Component name
- `&rpt.qty` - Quantity
- `&asm.mbr.description` - Description parameter
- `&rpt.index` - Item number
- `&asm.mbr.ptc_material_name` - Material

## Top-Down Design

### Skeleton Models

Create skeleton models (`_SKEL`) to:
- Define spatial relationships between components
- Share reference geometry across parts
- Enable concurrent engineering
- Control top-level design changes

### Skeleton Workflow

1. Create assembly skeleton part
2. Add datum features for component interfaces
3. Reference skeleton geometry in component models
4. Changes to skeleton propagate to all referencing parts

### External Copy Geometry

Use Publish/Subscribe or Copy Geometry to:
- Share geometry between models
- Create external references
- Maintain associativity across files

## Simplified Representations

| Type | Description |
|------|-------------|
| Graphics | Display only (no geometry access) |
| Geometry | Include geometry, exclude features |
| Symbolic | Substitute with simple geometry |
| Boundary Box | Show bounding box only |
| Light Graphics | Lightweight display |
| Master Rep | Full representation |
| Exclude | Hide component |

### Creating Simplified Reps

1. View > Manage Views > Simplified Representations
2. Create new rep with rules or manual selections
3. Include/exclude components by criteria
4. Save rep with assembly

## Interference and Clearance

### Interference Check

Analysis > Model > Global Interference
- Check all components or selected pairs
- Reports volume of interference
- Creates interference features

### Clearance Analysis

Analysis > Model > Global Clearance
- Specify minimum clearance distance
- Reports pairs violating clearance
- Creates clearance annotations

## Assembly Configuration Options

| Option | Description |
|--------|-------------|
| `comp_placement_assumptions` | Enable smart placement |
| `auto_constr_always_use_offset` | Default constraint behavior |
| `enable_assembly_intf_analysis` | Enable interference tools |
| `make_skeleton_rep_default` | New parts are skeletons |
| `def_comp_def_constraint` | Default constraint type |

## Assembly Best Practices

1. **First component**: Use Default constraint to fix at origin
2. **Fully constrain**: Ensure all components show green status
3. **Use subassemblies**: Break large assemblies into logical groups
4. **Name components**: Use descriptive instance names
5. **Skeleton models**: Use for complex top-down designs
6. **Simplified reps**: Create for large assembly performance
7. **Avoid external references**: When possible, reference within assembly
8. **Document structure**: Use layers and named views
