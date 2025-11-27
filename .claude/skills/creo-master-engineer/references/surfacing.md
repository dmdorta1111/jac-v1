# Surfacing Reference

## Surface Types in Creo

### Basic Surfaces

| Surface | Description | Key References |
|---------|-------------|----------------|
| Extrude | Linear projection of sketch | Sketch, depth, taper |
| Revolve | Rotation of profile about axis | Sketch, axis, angle |
| Sweep | Section along trajectory | Trajectory, section |
| Blend | Transitions between sections | Multiple sections, tangency |
| Fill | Closes boundary curves | Boundary curves |
| Offset | Parallel copy of surface | Source surface, distance |

### Advanced Surfaces

| Surface | Description | Requirements |
|---------|-------------|--------------|
| Boundary Blend | Multi-edge surface definition | 1-2 directions, boundary curves |
| Variable Section Sweep | Section changes along path | Trajectory, graph-driven section |
| Swept Blend | Blend along trajectory | Trajectory + multiple sections |
| Helical Sweep | Coiled surface | Axis, pitch, section |
| Style/ISDX | Freeform curve-driven | Control points, tangency |
| Freestyle | SubD modeling | Control mesh |

## Boundary Blend

### Direction Configuration

| Type | Chains | Use Case |
|------|--------|----------|
| One Direction | 2+ parallel | Simple loft between curves |
| Two Direction | 2+ each direction | Complex patch with all edges |

### Boundary Conditions

| Condition | Description | Icon |
|-----------|-------------|------|
| Free | No constraint at boundary | — |
| Tangent | G1 continuity to adjacent surface | T |
| Normal | Perpendicular to reference | ⊥ |
| Curvature | G2 continuity (smooth blend) | C |

### Boundary Blend Settings

- **Conic**: Control surface shape between boundaries
- **Control Points**: Add internal control curves
- **Approximate**: Allow tolerance for complex shapes

## Variable Section Sweep

### Section Control Methods

| Method | Description |
|--------|-------------|
| Constant | Same section along trajectory |
| Relation-driven | Section changes via relations |
| Graph-driven | Section parameters follow graph |
| Normal to Trajectory | Section perpendicular to path |
| Normal to Origin | Section orientation fixed |
| Normal to Projection | Section normal to projected curve |

### Trajectory Types

- **Selected curve**: Existing datum curve or edge
- **Sketched**: Internal trajectory sketch
- **Two trajectories**: Section spans between paths

## Style/ISDX (Interactive Surface Design)

### Curve Types

| Type | Description |
|------|-------------|
| Free | Unconstrained control points |
| Planar | Curve lies in single plane |
| COS (Curve on Surface) | Constrained to surface |
| 3D | Full 3D space curve |

### Curve Controls

- **Control Points**: Manipulate curve shape
- **Tangent Vectors**: Direction at endpoints
- **Curvature**: Degree of curvature at points
- **Soft Points**: Intermediate shape influence

### ISDX Surfaces

| Surface | Description |
|---------|-------------|
| Boundary | 2-4 curves define edges |
| Loft | Transition between profile curves |
| Blend | Smooth connection between surfaces |

### ISDX Connection Types

| Type | Continuity | Visual Result |
|------|------------|---------------|
| Free | G0 | Visible edge |
| Tangent | G1 | Smooth but visible seam |
| Curvature | G2 | Smooth, invisible seam |

## Freestyle (SubD Modeling)

### Concepts

- **Control Mesh**: Coarse cage defining shape
- **Subdivision**: Smoothing of control mesh
- **Resolution**: Display smoothness level

### Operations

| Operation | Description |
|-----------|-------------|
| Extrude | Pull faces to create geometry |
| Split | Divide faces for detail |
| Bridge | Connect separate regions |
| Crease | Sharp edge on smooth surface |
| Mirror | Symmetric editing |

### Freestyle Workflow

1. Create primitive (box, sphere, cylinder)
2. Manipulate control mesh vertices/edges/faces
3. Add subdivisions for detail
4. Apply creases for sharp features
5. Convert to surface geometry

## Surface Operations

### Editing Operations

| Operation | Purpose |
|-----------|---------|
| Merge | Combine quilts into single quilt |
| Trim | Cut surface with curve or surface |
| Extend | Lengthen surface edge |
| Offset | Create parallel surface |
| Thicken | Convert surface to solid |
| Transform | Move, rotate, mirror surface |

### Analysis Tools

| Tool | Purpose |
|------|---------|
| Curvature | Display surface curvature |
| Reflection | Show surface quality via reflections |
| Deviation | Check surface distance |
| Draft | Verify draft angles |
| Slope | Display surface angles |
| Section | Cross-section analysis |

## Surface Quality

### Continuity Levels

| Level | Name | Description |
|-------|------|-------------|
| G0 | Positional | Surfaces touch |
| G1 | Tangent | Same direction at edge |
| G2 | Curvature | Same curvature at edge |
| G3 | Curvature Rate | Smooth curvature change |

### Quality Indicators

| Check | Purpose |
|-------|---------|
| Zebra Stripes | Visualize G1/G2 continuity |
| Curvature Plot | Show curvature distribution |
| Highlight Lines | Check surface smoothness |
| Gaussian Curvature | Detect surface anomalies |

## Solidification

### Surface to Solid Conversion

| Method | Use Case |
|--------|----------|
| Solidify | Closed quilt becomes solid |
| Thicken | Open surface gets thickness |
| Use Quilt | Cut or add with surface |

### Solidify Requirements

- Quilt must be closed (watertight)
- No self-intersections
- Single volume

## Surfacing Best Practices

1. **Plan curve network** before creating surfaces
2. **Match tangency** at all surface boundaries
3. **Use curvature continuity** for Class A surfaces
4. **Check zebra stripes** for quality assessment
5. **Minimize patches** for cleaner geometry
6. **Reference existing geometry** for parametric control
7. **Use Style/ISDX** for aesthetic surfaces
8. **Test draft angles** early for manufacturing
9. **Verify closed quilts** before solidification
10. **Document surface intent** with named features
