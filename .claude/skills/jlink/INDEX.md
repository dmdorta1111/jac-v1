# Jlink Skill Reference Index

Quick navigation to all Jlink reference files.

## Core Files

### SKILL.md
Main quick reference guide. Start here for:
- Quick introduction to Jlink concepts
- Architecture overview
- Basic patterns for all major operations
- Common tasks decision tree
- Installation & setup instructions

**Contains:** Session model, exception handling, object hierarchy, 6 core packages, basic patterns for models/features/parameters/selection/assembly/drawing

---

## Reference Files by Topic

### Session Management
**File:** `jlink-session.md`

Topics covered:
- Session creation & retrieval (GetCurrentSessionWithCompatibility)
- Session lifecycle
- Session attributes & state
- Model retrieval via session
- Interactive selection & UICommand
- Error handling patterns
- Performance patterns (batch operations, lazy loading)
- Async connections

**When to use:** Setting up Jlink, managing session context, batch processing

---

### Feature Operations
**File:** `jlink-features.md`

Topics covered:
- 17+ feature types (extrude, hole, pocket, etc.)
- Accessing features (by name, iterate all, by type, root features)
- Feature properties & state
- Creating features (basic pattern, extrude, hole, pocket examples)
- Modifying features (suppress, rename, delete, reorder)
- Dimensions & parameters
- Feature dependencies & references
- Error handling
- Best practices

**When to use:** Creating/modifying features, accessing feature dimensions, handling feature hierarchies

---

### Parameter Operations
**File:** `jlink-parameters.md`

Topics covered:
- Parameter basics (get/set, types)
- Listing parameters (all, by type, filtering)
- Setting parameters (single, batch, type-specific)
- Creating new parameters
- Parameter validation
- Units & conversions
- Relations
- Dimension vs. parameter distinction
- Error handling
- Performance patterns (caching, batch operations)

**When to use:** Modifying model parameters, batch updates, parameter validation, extracting design data

---

### Assembly Operations
**File:** `jlink-assembly.md`

Topics covered:
- Assembly basics (create, open)
- Adding components (single, multiple, with offset)
- Working with components (list, get info, get location)
- Constraints (mate, distance, fix examples)
- Assembly properties & status
- Component iteration pattern
- Subassembly access & recursive processing
- Error handling
- Performance patterns (batch creation)

**When to use:** Building assemblies, applying constraints, processing component hierarchies

---

### Complete Patterns & Workflows
**File:** `jlink-patterns.md`

Six complete, production-ready patterns:

1. **Batch Model Parameter Update** - Modify parameters in multiple models efficiently
2. **Assembly Generation from Spreadsheet Data** - Create assemblies from external data
3. **Feature Parameter Extraction** - Extract all parameters/dimensions for reporting
4. **Model Configuration from Parameters** - Change model variants based on parameters
5. **Complete Error Handling Wrapper** - Robust error handling with logging
6. **Performance-Optimized Batch Processing** - High-performance batch operations

**When to use:** Building production applications, complex workflows, error-resilient systems

---

## Quick Lookup by Task

**I want to...**

### Basic Operations
- **Get session** → SKILL.md "Session Model" → jlink-session.md "Session Creation"
- **Open a model** → SKILL.md "Basic Patterns" → jlink-session.md "Model Retrieval"
- **Create a model** → SKILL.md "Basic Patterns" → jlink-session.md "Session Lifecycle"

### Feature Work
- **Create a feature** → SKILL.md "Feature Access & Creation" → jlink-features.md "Creating Features"
- **Modify feature** → jlink-features.md "Modifying Features"
- **Get feature dimensions** → jlink-features.md "Dimensions & Parameters"
- **List all features** → jlink-features.md "Iterate All Features"

### Parameters
- **Get parameter value** → jlink-parameters.md "Get Parameter by Name"
- **Set parameter** → jlink-parameters.md "Modify Parameter Value"
- **List all parameters** → jlink-parameters.md "Get All Model Parameters"
- **Create new parameter** → jlink-parameters.md "Add New Parameter"

### Assembly
- **Create assembly** → jlink-assembly.md "Create Assembly"
- **Add component** → jlink-assembly.md "Add Component to Assembly"
- **Apply constraint** → jlink-assembly.md "Apply Mate Constraint"
- **List components** → jlink-assembly.md "List All Components"

### Complex Tasks
- **Update many models** → jlink-patterns.md "Pattern 1: Batch Update"
- **Generate assembly from data** → jlink-patterns.md "Pattern 2: Assembly Generation"
- **Extract parameters for report** → jlink-patterns.md "Pattern 3: Parameter Extraction"
- **Handle errors robustly** → jlink-patterns.md "Pattern 5: Error Handling"

### Performance
- **Optimize batch processing** → jlink-session.md "Batch Operations" → jlink-patterns.md "Pattern 6"
- **Improve speed** → jlink-parameters.md "Performance Patterns"

### Troubleshooting
- **Session errors** → jlink-session.md "Error Handling"
- **Feature creation failures** → jlink-features.md "Error Handling"
- **Constraint problems** → jlink-assembly.md "Error Handling"
- **Parameter not found** → jlink-parameters.md "Error Handling"

---

## File Map

```
jlink/
├── SKILL.md                    [Quick reference, start here]
├── INDEX.md                    [This file]
├── jlink-session.md           [Session management]
├── jlink-features.md          [Feature creation/modification]
├── jlink-parameters.md        [Parameter operations]
├── jlink-assembly.md          [Assembly automation]
└── jlink-patterns.md          [Complete end-to-end patterns]
```

---

## Learning Path

### Beginner
1. Read SKILL.md completely (10 min)
2. Study jlink-session.md (10 min)
3. Work through Pattern 1: Batch Update (20 min)
4. Practice with your own models

### Intermediate
1. Master jlink-features.md (15 min)
2. Master jlink-parameters.md (15 min)
3. Study Pattern 3: Parameter Extraction (15 min)
4. Build parameter-driven applications

### Advanced
1. Deep dive jlink-assembly.md (20 min)
2. Study Pattern 2 & 4: Assembly generation (20 min)
3. Study Pattern 5: Error handling patterns (10 min)
4. Study Pattern 6: Performance optimization (10 min)
5. Build production systems

### Expert
- Review all error handling sections (10 min)
- Combine patterns for complex workflows (varies)
- Optimize for your specific use cases

---

## Common Workflows (Quick Start)

### Workflow: Modify Single Model Parameter

```
SKILL.md [Basic Patterns]
  → jlink-session.md [Model Retrieval]
  → jlink-parameters.md [Modify Parameter Value]
Time: 5 min
```

### Workflow: Build Assembly from Components

```
SKILL.md [Assembly Operations]
  → jlink-assembly.md [Adding Components]
  → jlink-assembly.md [Constraints]
Time: 15 min
```

### Workflow: Batch Update 100 Models

```
jlink-patterns.md [Pattern 1: Batch Update]
  → jlink-session.md [Batch Operations]
  → jlink-parameters.md [Batch Parameter Updates]
Time: 30 min to implement
```

### Workflow: Create Configurable Product Line

```
SKILL.md [Overview]
  → jlink-patterns.md [Pattern 4: Configuration]
  → jlink-features.md [Suppress/Unsuppress]
Time: 1 hour to design, 30 min to implement
```

---

## Key Concepts

### Must Know (Read First)
1. Session is entry point (GetCurrentSessionWithCompatibility)
2. All operations throw jxthrowable (use try-catch)
3. Regenerate after feature/parameter changes
4. References become invalid after regen (re-fetch if needed)
5. ~~UISetComputeMode~~ - Not available in Creo 12.4 OTK API

### Should Know (Before Production)
1. Proper error handling & logging
2. Parameter validation before applying
3. Constraint conflict resolution
4. Assembly hierarchies & recursion
5. Performance optimization techniques

### Nice to Know (Advanced)
1. Async connections for distributed systems
2. UI command integration
3. Advanced constraint patterns
4. Custom model processors
5. Integration with external systems (Excel, DB, etc.)

---

## API Version Notes

All documentation verified against **Creo 12.4.0.0** with **Object TOOLKIT Java (OTK)**

- CreoCompatibility.C4Compatible (recommended)
- pfcSession, pfcModel, pfcFeature, pfcModelItem, pfcSolid, pfcComponentFeat packages
- Standard exception: jxthrowable
- JAR files: `otk.jar`, `pfcasync.jar` (in `Common Files/text/java/`)

### Creo 12.4 API Verified Methods
| Class | Method | Notes |
|-------|--------|-------|
| Session | `GetCurrentDirectory()` | ✅ Returns String |
| Model | `GetFullName()` | ✅ Use instead of GetModelName() |
| Feature | `GetStatus()` | ✅ Returns FeatureStatus enum |
| Feature | `ListSubItems(ModelItemType)` | ✅ For dimensions |
| BaseDimension | `GetDimValue()` | ✅ Returns double |
| ComponentFeat | `GetModelDescr()` | ✅ Not GetModelDescriptor() |
| Solid | `GetPrincipalUnits()` | ✅ For unit system |

### Non-Existent Methods (Common Errors)
- ~~`session.IsAlive()`~~ - Use try-catch validation
- ~~`session.GetWorkingDirectory()`~~ - Use `GetCurrentDirectory()`
- ~~`session.UISetComputeMode()`~~ - Not available in Creo 12.4
- ~~`model.GetModelName()`~~ - Use `GetFullName()` or `GetFileName()`
- ~~`feat.GetSuppressed()`~~ - Use `GetStatus() == FEAT_SUPPRESSED`
- ~~`feat.GetFailed()`~~ - Use `GetStatus() == FEAT_UNREGENERATED`
- ~~`feat.ListDimensions()`~~ - Use `ListSubItems(ITEM_DIMENSION)`
- ~~`dim.GetValue()`~~ - Use `GetDimValue()` (BaseDimension)
- ~~`compFeat.GetModelDescriptor()`~~ - Use `GetModelDescr()`
- ~~`model.GetUnitsystem()`~~ - Use `Solid.GetPrincipalUnits().GetName()`

Check version-specific behaviors in official PTC documentation for:
- Constraint types (some Creo versions add new types)
- Feature creation parameters (may vary slightly)
- UI command integration (varies by version)

---

## Next Steps

1. **Read SKILL.md** - Understand the basics (15 min)
2. **Choose your task** - Use "Quick Lookup by Task" (2 min)
3. **Read relevant reference file** - Deep dive specific topic (10-20 min)
4. **Study matching pattern** - See working code example (10 min)
5. **Implement & test** - Build your application (varies)
6. **Refer back as needed** - Keep this index handy

Good luck with your Jlink development!
