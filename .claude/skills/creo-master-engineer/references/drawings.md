# Drawings and Documentation Reference

## Drawing Environment

### Creating Drawings

1. File > New > Drawing
2. Select template (a_drawing, c_drawing, etc.)
3. Choose default model (part or assembly)
4. Set sheet size and format

### Drawing Structure

| Element | Description |
|---------|-------------|
| Sheet | Individual drawing page |
| Format | Border, title block, zones |
| View | Model projection on sheet |
| Table | Tabular data (BOM, hole chart) |
| Annotation | Dimensions, notes, symbols |

## View Types

### Standard Views

| View | Description |
|------|-------------|
| General | Primary view with custom orientation |
| Projection | Orthographic from existing view |
| Detailed | Magnified area |
| Auxiliary | View normal to inclined surface |
| Section | Cross-section through model |

### Section View Types

| Type | Description |
|------|-------------|
| Full | Complete section through model |
| Half | Half section (symmetric parts) |
| Local | Partial breakout section |
| Revolved | Section rotated into view plane |
| Aligned | Section with revolved features |
| Total Unfold | All sections in single view |
| Area Unfold | Specific area unfolded |

### Specialized Views

| View | Purpose |
|------|---------|
| Broken | Elongated parts with break |
| Partial | Portion of model |
| Exploded | Assembly expansion |
| Process | Manufacturing sequence |
| Draft | 2D sketched view |

## View Creation

### General View

1. Layout > General (or double-click sheet)
2. Select view orientation
3. Choose model state (simplified rep, combined state)
4. Set display style and scale
5. Place on sheet

### View Properties

| Property | Options |
|----------|---------|
| Scale | Custom, sheet, 1:1, fit |
| Display Style | Wireframe, hidden, no hidden |
| Tangent Edges | None, dimmed, solid |
| View State | Combined state selection |

### View Display Styles

| Style | Description |
|-------|-------------|
| Wireframe | All edges visible |
| Hidden Line | Hidden edges dashed |
| No Hidden | Hidden edges removed |
| Shaded | Rendered view |

## Dimensions

### Showing Model Dimensions

1. Select feature in model tree
2. Right-click > Show Model Annotations
3. Or: Annotate > Show Model Annotations

### Creating Drawing Dimensions

1. Annotate > Dimension
2. Select geometry (edges, surfaces, vertices)
3. Place dimension on sheet
4. Modify properties as needed

### Dimension Types

| Type | Usage |
|------|-------|
| Linear | Distance between elements |
| Radial | Arc/circle radius |
| Diameter | Circle/cylinder diameter |
| Angular | Angle between lines |
| Ordinate | Baseline dimensioning |
| Reference | Non-driving (parentheses) |

### Dimension Properties

| Property | Options |
|----------|---------|
| Tolerance | Plus/Minus, Limits, Symmetric |
| Text | Prefix, suffix, override |
| Display | Decimal places, dual units |
| Leader | Arrow style, attachment |

## Annotations

### Notes

| Type | Purpose |
|------|---------|
| Unattached | General note, no leader |
| Leader | Note attached to geometry |
| On Item | Note embedded in item |
| Balloon | Part callout (BOM reference) |

### Geometric Tolerances (GD&T)

| Symbol | Control |
|--------|---------|
| ⌖ | Position |
| ⌓ | Concentricity |
| ⊕ | Symmetry |
| ⟂ | Perpendicularity |
| ∥ | Parallelism |
| ∠ | Angularity |
| ○ | Circularity |
| ⌯ | Cylindricity |
| ⌭ | Profile of line |
| ⌮ | Profile of surface |
| ↗ | Runout |
| ↗↗ | Total runout |
| ⏥ | Flatness |
| — | Straightness |

### Surface Finish Symbols

| Symbol | Ra Value |
|--------|----------|
| ∇ | Machined (general) |
| ∇∇ | Fine finish |
| ∇∇∇ | Very fine |
| ⊿ | Lay direction symbol |

### Weld Symbols

Basic weld symbol structure:
- Reference line
- Arrow pointing to joint
- Weld type symbol
- Size, length, pitch

## Tables

### Bill of Materials (BOM)

1. Table > BOM Table
2. Select BOM template
3. Define repeat region
4. Specify parameters to display

### Repeat Region Parameters

| Parameter | Description |
|-----------|-------------|
| `&rpt.index` | Row number |
| `&rpt.qty` | Component quantity |
| `&asm.mbr.name` | Component name |
| `&asm.mbr.type` | Component type |
| `&asm.mbr.param` | Custom parameter |

### Other Tables

| Table | Purpose |
|-------|---------|
| Hole Table | Hole locations and sizes |
| Family Table | Instance variations |
| General Table | Custom tabular data |
| Revision Table | Drawing revisions |

## Formats and Templates

### Format Elements

| Element | Purpose |
|---------|---------|
| Border | Sheet boundary |
| Title Block | Drawing identification |
| Zone Grid | Location reference |
| Revision Block | Change history |

### Format Symbols

| Symbol | Value |
|--------|-------|
| `&todays_date` | Current date |
| `&model_name` | Model filename |
| `&scale` | View scale |
| `&dwg_name` | Drawing name |
| `¤t_sheet` | Sheet number |
| `&total_sheets` | Total sheet count |

## Detail Options

### Common Detail Options

| Option | Description |
|--------|-------------|
| `drawing_units` | Drawing measurement units |
| `default_font` | Text font |
| `text_height` | Default text size |
| `dim_leader_length` | Leader line length |
| `witness_line_offset` | Gap to geometry |
| `witness_line_delta` | Extension beyond dim |
| `tolerance_standard` | ANSI, ISO, etc. |
| `gtol_datums` | Datum display format |
| `crossec_arrow_style` | Section arrow style |

## Configuration Options

| Option | Description |
|--------|-------------|
| `pro_dtl_setup_dir` | Detail options directory |
| `drawing_setup_file` | Default detail options |
| `template_drawing` | Default drawing template |
| `pro_format_dir` | Format file directory |
| `default_draw_scale` | Initial view scale |
| `make_parameters_from_fmt_tables` | Extract format parameters |

## Drawing Best Practices

1. **Use templates** - Standardize formats and detail options
2. **Show model dimensions** - Prefer shown over created
3. **Organize views logically** - Standard view arrangement
4. **Apply consistent scale** - Use sheet scale when possible
5. **Layer annotations** - Organize by type
6. **Name views** - Descriptive view names
7. **Use combined states** - Control annotation visibility
8. **Check associativity** - Verify dimension links
9. **Review tolerances** - Confirm GD&T correctness
10. **Validate before release** - ModelCHECK or similar

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Missing dimensions | Model modified | Update sheet, re-show dims |
| Dimension in wrong view | Wrong selection | Move to view command |
| Broken annotations | Reference changed | Fix references or recreate |
| Scale mismatch | View scale differs | Set consistent scale |
| Hidden lines showing | Display style | Change view display |
