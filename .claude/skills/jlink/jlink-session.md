# Jlink Session Management

Session is the entry point and connection to Creo Parametric. All operations flow through it.

## Session Creation & Retrieval

### Get Current Session (Recommended)
```java
// Main pattern - use this in 99% of cases
Session session = pfcSession.GetCurrentSessionWithCompatibility(
    CreoCompatibility.C4Compatible  // Compatible with Creo 4.0+
);

// Now session is active and ready for use
Model model = session.RetrieveModel(descriptor);
```

**Compatibility Modes:**
- `CreoCompatibility.C4Compatible` - Creo 4.0+ (recommended)
- `CreoCompatibility.WildcardCompatible` - For mixed versions
- Use current Creo version compatibility for best performance

### Create New Session (Rare)
Only needed for standalone applications or async connections:

```java
// Standalone application context
try {
    AsyncConnection asyncConn = pfcAsyncConnection.AsyncConnection_Start(
        null,  // Use default Creo instance
        1000   // Timeout in ms
    );
    Session session = asyncConn.GetSession();
} catch (jxthrowable x) {
    // Failed to connect to Creo
}
```

## Session Lifecycle

```java
// 1. STARTUP PHASE
Session session = pfcSession.GetCurrentSessionWithCompatibility(
    CreoCompatibility.C4Compatible
);

// 2. WORKING PHASE
try {
    // All model/feature/parameter operations here
    Model model = session.RetrieveModel(descriptor);
    // ... modify model ...
    model.Save();
} catch (jxthrowable x) {
    // Handle errors
}

// 3. CLEANUP PHASE
// For current session: automatic (Creo manages it)
// For async connections: explicitly close
if (asyncConn != null) {
    asyncConn.Disconnect();
}
```

## Session Attributes & State

### Get Session Information
```java
// Get current working directory (returns String)
String currentDir = session.GetCurrentDirectory();

// Get current model
Model current = session.GetCurrentModel();

// Get active model (alternative)
Model active = session.GetActiveModel();

// Get environment variable
String envValue = session.GetEnvironmentVariable("PRO_DIRECTORY");
```

### Check Session Validity
```java
// NOTE: There is NO IsAlive() method in JLink API
// Use try-catch pattern to validate session

public boolean isSessionValid(Session session) {
    if (session == null) return false;
    try {
        // Attempt simple operation to verify session
        session.GetCurrentDirectory();
        return true;
    } catch (jxthrowable x) {
        // Session invalid or Creo closed
        return false;
    }
}
```

### Session Context
```java
// Get current window
Window mainWindow = session.GetCurrentWindow();

// Display status message (requires stringseq for args)
session.UIDisplayMessage("msg_file", "msg_key", null);

// NOTE: UISetComputeMode does NOT exist in Creo 12.4 OTK API
// For batch operations, simply process without UI mode changes
```

## Model Retrieval via Session

### Basic Retrieval
```java
// Define model descriptor
ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
    ModelType.MDL_PART,      // or MDL_ASSEMBLY, MDL_DRAWING
    "my_model",              // Model name (without extension)
    null                      // Directory (null = working directory)
);

// Retrieve from session
Model model = session.RetrieveModel(descr);

// Verify model loaded
if (model != null) {
    // Model is now active
    boolean isModified = model.GetModified();
}
```

### Multi-Model Retrieval
```java
// Open multiple models in sequence
Model model1 = session.RetrieveModel(descr1);
Model model2 = session.RetrieveModel(descr2);
Model model3 = session.RetrieveModel(descr3);

// All three are now in session
// Switch between them as needed
```

## Selection & UICommand

### Interactive Selection
```java
// Create UI command for selection
SelectionOptions opts = pfcSelection.SelectionOptions_Create();
opts.AddFilterType(SelectionType.SURFACE);  // Allow surface selection
opts.SetMaxSelectCount(3);                  // Max 3 selections

// Get user selection
Selection selection = session.UISelect(opts, null);

// Process selections
int count = selection.GetSelectionCount();
for (int i = 0; i < count; i++) {
    SelectedObject selObj = selection.GetSelectionItem(i);
    // Use selected object
}
```

### Create Menu Button
```java
// Create command
UICommand cmd = session.UICreateCommand("myapp.mycommand",
    new UICommandActionListener() {
        public void OnCommand(UICommand cmd) {
            // Handle button click
        }
    }
);

// Add to menu
try {
    session.UIAddButton(
        cmd,                    // Command object
        "My Menu",             // Menu location
        null,                  // Submenu
        "Do Something",        // Button label
        "Help text",           // Help text
        "icon.txt"             // Icon file (optional)
    );
} catch (jxthrowable x) {
    // Menu registration failed
}
```

## Error Handling

### Try-Catch Pattern
```java
Session session = null;
try {
    session = pfcSession.GetCurrentSessionWithCompatibility(
        CreoCompatibility.C4Compatible
    );

    // Session operations
    Model model = session.RetrieveModel(descriptor);

} catch (jxthrowable x) {
    // Session error (Creo not running, etc.)
    x.printStackTrace();
} finally {
    // Cleanup if needed
    if (session != null) {
        // Current session cleanup usually automatic
    }
}
```

### Common Session Errors
```
jxCOMException:        Creo not running
jxException:           Invalid session state
jxNotFoundException:   Model not found
jxAccessException:     Permission denied
jxGeneralException:    Unexpected error
```

## Performance Patterns

### Batch Operations (Multiple Models)
```java
Session session = pfcSession.GetCurrentSessionWithCompatibility(
    CreoCompatibility.C4Compatible
);

// NOTE: UISetComputeMode does NOT exist in Creo 12.4 OTK API
// Process models directly without batch mode wrapper

for (String modelName : modelNames) {
    try {
        Model m = session.RetrieveModel(
            pfcModel.ModelDescriptor_Create(
                ModelType.MDL_PART, modelName, null
            )
        );
        // Modify model
        m.Save();
    } catch (jxthrowable x) {
        // Log error and continue with next model
        System.err.println("Error processing " + modelName + ": " + x.getMessage());
    }
}
```

### Lazy Model Loading
```java
// Only load models when needed
Map<String, Model> modelCache = new HashMap<>();

Model getModel(String name) throws jxthrowable {
    if (!modelCache.containsKey(name)) {
        ModelDescriptor descr = pfcModel.ModelDescriptor_Create(
            ModelType.MDL_PART, name, null
        );
        modelCache.put(name, session.RetrieveModel(descr));
    }
    return modelCache.get(name);
}

// Use cache
Model m1 = getModel("part1");  // Loads from Creo
Model m2 = getModel("part1");  // Returns from cache
```

## Async Connections (Advanced)

### Standalone Application
```java
// Start async connection (standalone, not in Creo)
AsyncConnection asyncConn = pfcAsyncConnection.AsyncConnection_Start(
    null,          // Use default Creo instance
    10000          // 10 second timeout
);

try {
    Session session = asyncConn.GetSession();

    // Work with session
    Model model = session.RetrieveModel(descriptor);
    model.Regenerate(null);
    model.Save();

} catch (jxthrowable x) {
    // Handle error
} finally {
    asyncConn.Disconnect();  // Critical for async
}
```

### Remote Connection (Distributed Creo)
```java
// Connect to remote Creo server
AsyncConnection remoteConn = pfcAsyncConnection.AsyncConnection_Start(
    "remote-server.example.com:10000",  // Remote address
    30000  // 30 second timeout for network delays
);

try {
    Session session = remoteConn.GetSession();
    // Use session normally - works across network
} finally {
    remoteConn.Disconnect();
}
```

## Best Practices

1. **Always use GetCurrentSessionWithCompatibility()** - Don't try to create sessions manually
2. **Specify correct compatibility mode** - Match your target Creo version
3. **Use try-catch for all Session operations** - They can throw jxthrowable
4. **Batch operations with UISetComputeMode()** - Improves performance for multiple models
5. **Cache model references** - Avoid repeated RetrieveModel() calls
6. **Close async connections** - Use try-finally to ensure Disconnect()
7. **Check session validity via try-catch** - No IsAlive() method exists; use operation test pattern
8. **Log session state** - Essential for debugging batch processes
9. **Handle Creo shutdown** - Session becomes invalid if Creo closes
10. **Use descriptors with paths** - Fully specify model location for reliability

## API Reference (Creo 12.4.0.0)

### Session Methods (from BaseSession)
| Method | Returns | Description |
|--------|---------|-------------|
| `GetCurrentDirectory()` | `String` | Current working directory |
| `GetCurrentModel()` | `Model` | Currently active model |
| `GetActiveModel()` | `Model` | Active model (alternative) |
| `GetCurrentWindow()` | `Window` | Current window reference |
| `GetEnvironmentVariable(String)` | `String` | Environment variable value |
| `ChangeDirectory(String)` | `void` | Change working directory |
| `RetrieveModel(ModelDescriptor)` | `Model` | Load model into session |
| `ListModels()` | `Models` | All models in session |
| `SetConfigOption(String, String)` | `void` | Set config option |
| `GetConfigOption(String)` | `String` | Get config option value |

### Non-Existent Methods (Common Misconceptions)
- ~~`IsAlive()`~~ - Does not exist; use try-catch validation
- ~~`GetWorkingDirectory()`~~ - Use `GetCurrentDirectory()` instead
- ~~`GetProEPath()`~~ - Use `GetEnvironmentVariable("PRO_DIRECTORY")`
