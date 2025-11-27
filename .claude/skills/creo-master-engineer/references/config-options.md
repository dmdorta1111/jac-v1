# Configuration Options Reference

## Config.pro Overview

Config.pro is the main configuration file controlling Creo Parametric behavior. Options are loaded at startup from:

1. `<loadpoint>/text/config.pro` (system-wide)
2. `<home_directory>/config.pro` (user default)
3. Current working directory `config.pro` (session)

### Setting Options

| Method | Scope |
|--------|-------|
| File > Options | Current session + save |
| Edit config.pro | Requires restart |
| Command line | Session only |

## Essential Configuration Options

### File Management

| Option | Description | Values |
|--------|-------------|--------|
| `pro_library_dir` | Component library path | Directory path |
| `search_path` | Model search locations | Directory path(s) |
| `trail_dir` | Trail file location | Directory path |
| `save_objects` | Default save behavior | all, changed, changed_and_updated |
| `file_open_default_folder` | Initial open location | working_directory, in_session |
| `pro_save_model_display` | Save display state | wireframe, shaded, etc. |

### Display and Graphics

| Option | Description | Values |
|--------|-------------|--------|
| `graphics` | Graphics quality | opengl, win32_gdi |
| `shade_with` | Shading quality | default, realistic |
| `spin_center_display` | Show spin center | yes, no |
| `orientation` | Default view | isometric, trimetric, etc. |
| `display_axes` | Show datum axes | yes, no |
| `display_planes` | Show datum planes | yes, no |
| `default_dec_places` | Decimal precision | 1-14 |

### Model Defaults

| Option | Description | Values |
|--------|-------------|--------|
| `template_solidpart` | Part template file | Template path |
| `template_assembly` | Assembly template | Template path |
| `template_drawing` | Drawing template | Template path |
| `default_part_template` | Default part template | mmns_part_solid, inlbs_part_solid |
| `pro_unit_length` | Default length unit | unit_mm, unit_inch |
| `pro_unit_mass` | Default mass unit | unit_kilogram, unit_pound |

### Sketcher

| Option | Description | Values |
|--------|-------------|--------|
| `sketcher_lock_modified_dims` | Lock modified dims | yes, no |
| `sketcher_dec_places` | Sketch decimal places | 0-14 |
| `sketcher_disp_constraints` | Show constraints | yes, no |
| `sketcher_disp_dimensions` | Show dimensions | yes, no |
| `sketcher_refit_after_dim_modify` | Auto-refit | yes, no |

### Assembly

| Option | Description | Values |
|--------|-------------|--------|
| `comp_placement_assumptions` | Smart placement | yes, no |
| `auto_constr_always_use_offset` | Default to offset | always, never, when_possible |
| `enable_assembly_intf_analysis` | Interference tools | yes, no |
| `retrieve_data_sharing_ref_parts` | Load ref parts | yes, no |

### Manufacturing

| Option | Description | Values |
|--------|-------------|--------|
| `pro_mf_param_dir` | MFG parameters | Directory path |
| `pro_mf_cl_dir` | CL file output | Directory path |
| `ncpost_type` | NC post format | ncl, apt, etc. |

### Sheet Metal

| Option | Description | Values |
|--------|-------------|--------|
| `pro_smt_db_dir` | Bend table directory | Directory path |
| `smt_drive_tools_by_parameters` | Parameter control | yes, no |
| `default_bend_radius` | Default bend radius | Value |

### Drawing

| Option | Description | Values |
|--------|-------------|--------|
| `drawing_setup_file` | Detail options file | File path |
| `pro_dtl_setup_dir` | DTL files directory | Directory path |
| `pro_format_dir` | Format files | Directory path |
| `default_draw_scale` | Default scale | Value (e.g., 1.0) |
| `template_drawing` | Drawing template | Template path |

### Performance

| Option | Description | Values |
|--------|-------------|--------|
| `regen_failure_handling` | Failure behavior | resolve_mode, no_resolve_mode |
| `mass_property_calculate` | Auto-calculate mass | automatic, by_request |
| `enable_absolute_accuracy` | Absolute accuracy | yes, no |
| `accuracy` | Relative accuracy | 0.0001-0.01 |

### Interface

| Option | Description | Values |
|--------|-------------|--------|
| `menu_translation` | Menu language | yes, no |
| `help_path` | Help file location | Directory path |
| `pro_colormap_path` | Color scheme | File path |
| `bell` | System beep | yes, no |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PRO_COMM_MSG_EXE` | Communication executable |
| `CREO_ROOT` | Creo installation path |
| `PRO_DIRECTORY` | Startup directory |
| `PTC_LICENSE_FILE` | License server |
| `LANG` | Language setting |

## Detail Options (Drawing)

Located in `.dtl` files, control drawing appearance.

### Dimension Detail Options

| Option | Description |
|--------|-------------|
| `dim_leader_length` | Leader line length |
| `witness_line_offset` | Gap to geometry |
| `witness_line_delta` | Extension past dim |
| `default_dim_num_digits` | Decimal places |
| `text_height` | Text size |
| `default_font` | Font name |

### Tolerance Options

| Option | Description |
|--------|-------------|
| `tolerance_standard` | Standard (ANSI, ISO) |
| `tol_display` | Tolerance display format |
| `linear_tol_display` | Linear tolerance format |
| `angular_tol_display` | Angular tolerance format |

### Section Options

| Option | Description |
|--------|-------------|
| `crossec_arrow_style` | Arrow style |
| `crossec_arrow_length` | Arrow length |
| `crossec_arrow_width` | Arrow width |

## Mapkeys

Custom keyboard shortcuts stored in config.pro:

### Mapkey Syntax

```
mapkey key_sequence \
  command_sequence;
```

### Example Mapkeys

```
mapkey $F1 @MAPKEY_LABELFront View;\
  mapkey(continued) ~ Command `ProCmdViewName` `FRONT`;

mapkey vv @MAPKEY_LABELDefault View;\
  mapkey(continued) ~ Command `ProCmdViewDefault`;

mapkey ss @MAPKEY_LABELSave;\
  mapkey(continued) ~ Command `ProCmdModelSave`;
```

## Best Practices

1. **Start with company standard** - Use approved config.pro
2. **Document custom options** - Comment non-standard settings
3. **Use config.sup** - For options that cannot be overridden
4. **Test thoroughly** - Verify options work as expected
5. **Version control** - Track configuration changes
6. **Minimize customization** - Avoid excessive options
7. **Template consistency** - Match templates to config
8. **Path organization** - Use logical directory structure
9. **Backup configurations** - Preserve working setups
10. **Train users** - Document option purposes

## Troubleshooting

| Issue | Possible Cause | Solution |
|-------|----------------|----------|
| Option ignored | Syntax error | Check spelling and values |
| Conflict | Duplicate options | Remove duplicates |
| Not loading | Wrong location | Verify config.pro path |
| Performance issues | Incompatible options | Review graphics settings |
| Template not found | Invalid path | Check template_* paths |
