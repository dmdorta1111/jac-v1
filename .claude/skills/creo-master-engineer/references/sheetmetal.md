# Sheet Metal Design Reference

## Sheet Metal Mode

Convert to sheet metal mode: Applications > Sheetmetal

### Model Properties

| Property | Description |
|----------|-------------|
| Thickness | Material thickness (constant) |
| Bend Radius | Default inside bend radius |
| Bend Allowance | Developed length calculation method |
| K-Factor | Neutral axis position (0.0-0.5) |
| Y-Factor | Alternative bend calculation |

## Sheet Metal Features

### Primary Walls

| Feature | Description | References |
|---------|-------------|------------|
| Flat | First flat wall from sketch | Sketch outline |
| Extrude | Wall perpendicular to existing | Edge + sketch |
| Revolve | Curved wall about axis | Sketch + axis |
| Planar | Wall on existing plane | Plane + sketch |

### Attached Walls

| Feature | Description | Key Parameters |
|---------|-------------|----------------|
| Flange | Wall bent from edge | Angle, height, relief |
| Flat Wall | Flat extension from edge | Length, angle |
| Twist Wall | Twisted surface extension | Angle, length |
| Extend Wall | Extend existing wall | Distance |

### Bend Features

| Feature | Purpose |
|---------|---------|
| Bend | Add bend to flat geometry |
| Unbend | Flatten bent geometry |
| Bend Back | Re-bend previously unbent |
| Flat Pattern | Complete flat state view |

### Form Features

| Feature | Description |
|---------|-------------|
| Punch | Form from die geometry |
| Die | Custom formed shape |
| Flatten Form | Flatten formed area |
| Sketched Form | Sketch-defined form |
| Quilt Form | Surface-based form |

### Cut and Notch

| Feature | Description |
|---------|-------------|
| Cut | Remove material (sketch-based) |
| Notch | Corner relief cut |
| Corner Relief | Automatic bend corner cut |
| Rip | Tear/split wall |

## Bend Properties

### Bend Position Types

| Type | Description |
|------|-------------|
| Inside | Bend radius on inside of thickness |
| Outside | Bend radius on outside |
| Bend Line | Centerline of bend arc |
| Profile on Edge | Profile stays on original edge |
| Offset from Bend Start | Custom offset position |

### Bend Relief Types

| Type | Shape | Use Case |
|------|-------|----------|
| No Relief | None | Adjacent walls |
| Rectangular | Rectangle | Standard relief |
| Obround | Rounded rectangle | Reduced stress |
| Tear | Slit | No material removal |
| Rip | Full tear | Separate walls |

### Corner Relief Types

| Type | Description |
|------|-------------|
| No Relief | No corner treatment |
| Rectangular | Square corner cut |
| Circular | Round corner cut |
| Obround | Oblong corner cut |
| V-Notch | V-shaped corner cut |

## Bend Allowance Methods

### K-Factor Method

K-Factor = Neutral Axis Location / Thickness

| Material | K-Factor Range |
|----------|----------------|
| Aluminum | 0.30 - 0.35 |
| Steel | 0.40 - 0.45 |
| Stainless | 0.45 - 0.50 |

Formula: `BA = π/180 × Angle × (Radius + K × Thickness)`

### Y-Factor Method

Y-Factor = K-Factor × (π/2)

Formula: `BA = (Radius + Y × Thickness) × Angle × π/180`

### Bend Table Method

Use manufacturer-specific bend tables:
1. Define bend table file (.bnd)
2. Specify radius and thickness combinations
3. Creo interpolates for unlisted values

### Bend Allowance Formula

`Developed Length = Leg1 + Leg2 + Bend Allowance`

Where:
- Leg1, Leg2 = Flat lengths to bend tangent points
- BA = Calculated from K-factor or table

## Flat Pattern

### Flat Pattern Instance

Create flat pattern view:
1. Select Flat Pattern icon
2. Choose fixed face (stationary during unbend)
3. View flat developed state

### Flat Pattern Options

| Option | Description |
|--------|-------------|
| Fixed Geometry | Face that stays stationary |
| Bend Order | Sequence of bends in forming |
| Break Corners | Add corner breaks |
| Merge Walls | Combine coplanar walls |

### Flat Pattern Parameters

| Parameter | Description |
|-----------|-------------|
| SMT_FLAT_Y_DIM | Flat pattern Y dimension |
| SMT_FLAT_X_DIM | Flat pattern X dimension |
| SMT_DEVELOPED_LEN | Total developed length |
| SMT_NUM_BENDS | Number of bends |

## Sheet Metal Parameters

### Default Parameters (SMT_)

| Parameter | Description | Default |
|-----------|-------------|---------|
| SMT_DFLT_BEND_RADIUS | Default bend radius | 1.0 |
| SMT_DFLT_THICKNESS | Default thickness | 1.0 |
| SMT_DFLT_K_FACTOR | Default K-factor | 0.33 |
| SMT_DFLT_Y_FACTOR | Default Y-factor | 0.50 |
| SMT_DFLT_BEND_REL_TYPE | Bend relief type | RECT |
| SMT_DFLT_BEND_REL_WIDTH | Relief width | 0.5 |
| SMT_DFLT_BEND_REL_DEPTH | Relief depth | 0.5 |

### Conversion from Solid

Convert solid part to sheet metal:
1. Identify first wall (face + thickness)
2. Use Sheetmetal > Convert feature
3. Select driving surface
4. Define thickness direction
5. Specify conversion options

## Configuration Options

| Option | Description |
|--------|-------------|
| `pro_smt_db_dir` | Bend table directory |
| `smt_drive_tools_by_parameters` | Use SMT parameters |
| `smt_drive_bend_by_parameters` | Bend parameters control |
| `smt_form_dir` | Form feature directory |
| `default_bend_radius` | System default radius |

## Sheet Metal Best Practices

1. **Set material parameters first** - Thickness, K-factor, bend radius
2. **Start with base wall** - Flat wall establishes reference
3. **Add flanges systematically** - Work outward from base
4. **Consider bend sequence** - Plan forming order
5. **Check flat pattern** - Verify blank size
6. **Use bend tables** - Match manufacturer specifications
7. **Define corner reliefs** - Prevent tearing
8. **Name bends descriptively** - Aid manufacturing documentation
9. **Validate with flat** - Check for overlaps/interferences
10. **Export flat DXF** - For laser/punch programming

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Flat pattern fails | Self-intersection | Add bend reliefs |
| Incorrect flat length | Wrong K-factor | Verify material properties |
| Flange won't create | Invalid edge selection | Check edge is on bend line |
| Corner collision | No corner relief | Add appropriate relief |
| Twist during unbend | Multiple bend paths | Define fixed geometry |
