# Troubleshooting and Best Practices Reference

## Feature Failure Resolution

### Common Failure Types

| Failure Type | Indicator | Cause |
|--------------|-----------|-------|
| Missing Reference | Red feature in tree | Deleted/renamed geometry |
| Regeneration Failure | Yellow/red status | Invalid geometry result |
| Failed Geometry | Error message | Self-intersection, invalid shape |
| Constraint Conflict | Over-constrained | Conflicting dimensions/relations |
| Invalid Section | Sketch error | Open contour, self-crossing |

### Resolve Mode

When regeneration fails:

1. **Investigate** - Click on failed feature to see error
2. **Quick Fix** - Attempt automatic resolution
3. **Fix Model** - Enter Resolve Mode for manual fixes
4. **Undo Changes** - Revert to pre-failure state

### Resolve Mode Options

| Option | Action |
|--------|--------|
| Redefine | Modify feature definition |
| Reroute | Change references |
| Suppress | Temporarily disable feature |
| Delete | Remove feature |
| Clip Suppress | Suppress children temporarily |
| Investigate | View failure details |

### Reference Management

**Reroute references:**
1. Right-click feature > Edit References
2. Select failed reference (highlighted)
3. Choose replacement geometry
4. Verify and accept

**Backup references:**
1. Right-click feature > Backup References
2. References stored for recovery
3. Use when original geometry may change

## Parent/Child Relationships

### Understanding Dependencies

| Relationship | Description |
|--------------|-------------|
| Parent | Feature providing reference |
| Child | Feature using reference |
| Direct | Immediate dependency |
| Indirect | Dependency through chain |

### Viewing Dependencies

- Right-click feature > Info > Parent/Child
- Tools > Reference Viewer
- Model Tree > Show > Reference Status

### Managing Dependencies

**Minimize external references:**
- Reference within same part when possible
- Use copy geometry for external shapes
- Consider skeleton models for assemblies

**Break unwanted dependencies:**
- Reroute to local geometry
- Use Make Independent option
- Copy geometry without references

## Model Quality Checks

### ModelCHECK

Automated quality verification:
1. Analysis > ModelCHECK > Run
2. Select metrics to evaluate
3. Review results report
4. Fix flagged issues

### Common Quality Issues

| Issue | Impact | Resolution |
|-------|--------|------------|
| Unnamed features | Maintenance difficulty | Rename descriptively |
| Unorganized parameters | Hard to manage | Group and name logically |
| Missing relations comments | Design intent unclear | Add documentation |
| External references | Fragile models | Internalize or document |
| Excessive features | Performance issues | Simplify or group |

### Geometry Verification

| Check | Purpose |
|-------|---------|
| Analysis > Geometry | Verify solid integrity |
| Analysis > Model > Short Edges | Find small geometry |
| Analysis > Model > Accuracy | Check model precision |
| Analysis > Surface > Deviation | Surface quality |

## Performance Optimization

### Large Assembly Strategies

| Strategy | Implementation |
|----------|----------------|
| Simplified Reps | Use lighter representations |
| Display Only | Graphic-only components |
| Layers | Hide unnecessary elements |
| Cross-sections | View with sections |
| Suppress | Disable non-essential features |

### Model Simplification

1. **Remove cosmetic features** - Rounds, chamfers for analysis
2. **Use envelopes** - Simplified component representation
3. **Create shrinkwrap** - Surface copy of complex geometry
4. **Merge features** - Combine where appropriate

### Regeneration Speed

| Technique | Benefit |
|-----------|---------|
| Feature order | Place complex features later |
| Reduce relations | Simplify when possible |
| Avoid patterns of patterns | Use multi-level patterns |
| Clean sketches | Remove unused geometry |

## Common Errors and Solutions

### Sketcher Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Section not closed" | Open contour | Close sketch geometry |
| "Over-constrained" | Too many constraints | Remove redundant constraints |
| "Under-constrained" | Missing constraints | Add dimensions/constraints |
| "Self-intersecting" | Sketch crosses itself | Redraw without crossings |

### Feature Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot intersect" | No solid/surface intersection | Check geometry relationship |
| "Thin wall" | Feature creates thin section | Increase thickness or adjust |
| "Surface not created" | Invalid surface definition | Review surface references |
| "Cannot complete cut" | Cut doesn't exit solid | Extend depth or change direction |

### Assembly Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot regenerate" | Component failure | Fix component model |
| "Reference not found" | Deleted reference | Reroute constraint |
| "Over-constrained" | Conflicting constraints | Remove/modify constraints |
| "Interference detected" | Components overlap | Adjust placement |

## Best Practices Summary

### Modeling

1. **Plan before modeling** - Sketch approach on paper
2. **Name everything** - Features, parameters, datum
3. **Build flexible models** - Design for change
4. **Document design intent** - Comments in relations
5. **Use templates** - Standardize starting points
6. **Test modifications** - Verify parametric behavior
7. **Review parent/child** - Minimize dependencies
8. **Group related features** - Organize model tree
9. **Regular saves** - Protect work with versions
10. **Clean up** - Remove unused features/sketches

### Assemblies

1. **Constrain fully** - No floating components
2. **Use subassemblies** - Logical groupings
3. **Document structure** - Clear organization
4. **Minimize external refs** - Keep models independent
5. **Use skeleton models** - For top-down design
6. **Create simplified reps** - Performance management
7. **Test motion** - Verify mechanisms work
8. **Check interference** - Before release
9. **Maintain BOM accuracy** - Review parameters
10. **Version control** - Track assembly changes

### Drawings

1. **Use templates** - Company standards
2. **Show model dimensions** - Not created dimensions
3. **Consistent annotation** - Same style throughout
4. **Verify tolerances** - Check GD&T accuracy
5. **Layer organization** - Separate annotation types
6. **Review before release** - Quality check all views
7. **Update when model changes** - Maintain associativity
8. **Document revisions** - Track drawing changes

## Recovery Procedures

### Corrupted Model Recovery

1. Try opening with simplified rep
2. Use File > Open > Retrieve w/o components
3. Open in earlier Creo version
4. Contact PTC support with trail file

### Trail File Usage

Trail files record all actions:
1. Rename `.txt` extension
2. Run with `creo_parametric -g:play trail.txt`
3. Stop before failure point
4. Save recovered state

### Backup Strategy

| Backup Type | Frequency | Retention |
|-------------|-----------|-----------|
| Working directory | Daily | 1 week |
| Project archive | Weekly | 1 month |
| Release versions | Per release | Permanent |
| Trail files | Session | 1 week |
