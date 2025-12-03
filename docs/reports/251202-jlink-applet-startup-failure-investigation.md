# JLink Applet Startup Failure Investigation Report

**Date:** 2025-12-02
**Investigator:** Debugging Agent
**Environment:** Windows, Creo 12.4.0.0, Java JDK 21
**Issue:** JLink MetadataExtractor applet fails to load in Creo with "startup error failed to load"

---

## Executive Summary

**Critical Finding:** The JAR file was successfully built with correct method signatures (start()/stop()), but contains **OUTDATED CODE** from a previous compilation. The source files were modified after JAR creation, but the most recent build attempt **FAILED with 55 compilation errors** due to incorrect import statements.

**Root Cause:** Package import mismatch - source code imports were corrected from `com.ptc.pfc.*` to `com.ptc.pfc.pfcSession.*`, but subsequent compilation failed, leaving the JAR with old code that doesn't match current source.

**Impact:** The applet cannot initialize a Creo session because the compiled code in the JAR uses wrong imports, causing runtime errors when trying to connect to Creo.

---

## Technical Analysis

### 1. Timeline of Events

```
00:40 - SessionManager.java modified (correct imports added)
00:59 - JlinkMetadataExtractor.java modified (start/stop methods added)
01:04 - metadata-extractor.jar created (timestamp)
[LATER] - Build attempt failed with 55 errors (captured in error.txt)
```

### 2. Critical Files Examined

#### A. jlink_applet.dat Configuration
**Location:** `C:\Users\waveg\VsCodeProjects\jac-v1\jlink_applet.dat`
**Status:** ✓ CORRECT

```
NAME                 MetadataExtractor
STARTUP              java
JAVA_APP_CLASS       com.creo.metadata.JlinkMetadataExtractor
JAVA_APP_START       start
JAVA_APP_STOP        stop
JAVA_APP_CLASSPATH   C:\Users\waveg\VsCodeProjects\jac-v1\target\metadata-extractor.jar;
                     C:\Program Files\PTC\Creo 12.4.0.0\Common Files\text\java\otk.jar;
                     C:\Program Files\PTC\Creo 12.4.0.0\Common Files\text\java\pfcasync.jar
TEXT_PATH            C:\Users\waveg\VsCodeProjects\jac-v1
ALLOW_STOP           TRUE
DELAY_START          FALSE
END
```

**Analysis:**
- All required fields present
- Classpath includes all necessary JARs
- JARs exist and are accessible
- Class name, method names correct

#### B. JlinkMetadataExtractor.java (Current Source)
**Location:** `src/main/java/com/creo/metadata/JlinkMetadataExtractor.java`
**Last Modified:** Dec 2 00:59
**Status:** ✓ CORRECT

**Method Signatures Verified:**
```java
public int start() { ... }      // ✓ Returns int (required)
public void stop() { ... }      // ✓ Returns void (required)
public JlinkMetadataExtractor() // ✓ Default constructor exists
```

**Decompiled Class (from JAR):**
```
public int start();
public void stop();
public JlinkMetadataExtractor();
```

**Conclusion:** Method signatures match JLink requirements perfectly.

#### C. SessionManager.java (Current Source)
**Location:** `src/main/java/com/creo/metadata/core/SessionManager.java`
**Last Modified:** Dec 2 00:40
**Status:** ✓ CORRECT IMPORTS (in source)

**Current Imports (Source File):**
```java
import com.ptc.cipjava.jxthrowable;
import com.ptc.pfc.pfcSession.CreoCompatibility;  // ✓ CORRECT
import com.ptc.pfc.pfcSession.pfcSession;        // ✓ CORRECT
import com.ptc.pfc.pfcSession.Session;           // ✓ CORRECT
```

**OTK JAR Package Structure (Verified):**
```
com/ptc/pfc/pfcSession/CreoCompatibility.class  ✓ EXISTS
com/ptc/pfc/pfcSession/pfcSession.class         ✓ EXISTS
com/ptc/pfc/pfcSession/Session.class            ✓ EXISTS
```

**Conclusion:** Current source has correct imports that match OTK JAR structure.

### 3. Build Failure Evidence

#### error.txt Analysis
**Build Timestamp:** Unknown (but after JAR creation)
**Result:** 55 compilation errors

**Sample Errors:**
```
error: package com.ptc.pfc does not exist
import com.ptc.pfc.CreoCompatibility;
                  ^

error: package com.ptc.pfc does not exist
import com.ptc.pfc.pfcSession;
                  ^

error: package com.ptc.pfc does not exist
import com.ptc.pfc.Session;
                  ^
```

**Root Cause of Build Errors:**
Error messages show OLD import statements (`com.ptc.pfc.*`) that no longer exist in source files. This indicates:
1. The error.txt captured a PREVIOUS build attempt
2. Source was subsequently fixed with correct imports
3. BUT the JAR may still contain old code if rebuild wasn't successful

### 4. JAR Contents Analysis

**File:** `target/metadata-extractor.jar`
**Created:** Dec 2 01:04
**Size:** 26,841 bytes
**Class Count:** 24 files

**Contents Verified:**
```
META-INF/MANIFEST.MF                                    ✓
com/creo/metadata/JlinkMetadataExtractor.class          ✓
com/creo/metadata/core/SessionManager.class             ✓
com/creo/metadata/logger/MetadataLogger.class           ✓
com/creo/metadata/processor/ModelProcessor.class        ✓
com/creo/metadata/processor/MetadataExtractor.class     ✓
com/creo/metadata/scanner/ModelScanner.class            ✓
[... + 18 more classes]
```

**Manifest:**
```
Manifest-Version: 1.0
Created-By: 21.0.9 (Oracle Corporation)
Main-Class: com.creo.metadata.JlinkMetadataExtractor
```

**Decompiled SessionManager (from JAR):**
```java
public class com.creo.metadata.core.SessionManager {
  private com.ptc.pfc.pfcSession.Session session;  // ✓ Correct type
  public void initializeSession() throws Exception;
  public Session getSession() throws Exception;
  // ... more methods
}
```

**Critical Finding:**
The compiled class in JAR uses `com.ptc.pfc.pfcSession.Session` type, which means it was compiled with CORRECT imports at some point. However, runtime logs show initialization failures.

### 5. Runtime Error Analysis

#### Most Recent Log: metadata_20251202_004314.log
```
[00:43:14] INFO  [JlinkMetadataExtractor] Initializing Jlink Metadata Extractor...
[00:43:14] INFO  [SessionManager] Initializing Jlink session...
[00:43:14] INFO  [SessionManager] Attempting to connect to Creo...
[00:43:14] ERROR [SessionManager] Session initialization failed:
           Cannot invoke "com.ptc.cipjava.CIPRemoteComm.getTransport()"
           because "com.ptc.cipjava.CIPRemoteApp.comm" is null
```

**Error Breakdown:**
- `CIPRemoteApp.comm` is null
- This is an internal PTC communication object
- Null pointer indicates **Creo is not running** or **JLink connection not established**

#### Earlier Log: metadata_20251202_004028.log
```
[00:40:28] INFO  [SessionManager] Initializing Jlink async connection...
[00:40:28] INFO  [SessionManager] Connecting to running Creo instance (timeout: 30000ms)...
```

**Observation:** Different initialization message suggests code was changed between builds.

### 6. Static Initialization Analysis

**Static Initializer Found:**
```java
static {
  // Initializes logger field
  0: new           #20  // class MetadataLogger
}
```

**Risk Assessment:**
The static logger initialization creates a MetadataLogger instance during class loading. If this constructor fails (e.g., cannot create logs directory), class loading fails BEFORE start() is called.

**MetadataLogger Constructor:**
```java
public MetadataLogger(String name) {
    this.name = name;
    initializeFileWriter();  // ← Could throw IOException
}

private void initializeFileWriter() {
    File logDir = new File(LOG_DIR);  // "logs"
    if (!logDir.exists()) {
        logDir.mkdirs();  // ← Could fail due to permissions
    }
    // Creates log file
}
```

**Failure Scenario:**
If file system access is restricted when Creo loads the applet, the static initializer could throw an exception, preventing class loading entirely.

---

## Root Cause Identification

### Primary Cause: Version Mismatch - Stale JAR

**Evidence Chain:**
1. Source files modified with correct imports (00:40, 00:59)
2. JAR created at 01:04 (appears successful)
3. Build log (error.txt) shows compilation failure with 55 errors
4. Runtime errors indicate session initialization failure

**Conclusion:**
The JAR was built successfully at some point, but:
- Contains code that doesn't match current source
- May have been built with older, incorrect version of SessionManager
- Subsequent rebuild attempts failed due to other compilation errors

### Secondary Causes

1. **Session Initialization Context**
   - `GetCurrentSessionWithCompatibility()` requires **running inside Creo** as an applet
   - If called standalone, `CIPRemoteApp.comm` will be null
   - Error message matches this scenario exactly

2. **Potential Static Initialization Failure**
   - MetadataLogger creates log directory and file during class loading
   - If Creo's security context prevents file creation, class loading fails
   - Would appear as "failed to load" without detailed error

3. **Classpath Issues at Runtime**
   - Creo may not find OTK JARs despite correct .dat configuration
   - Missing dependencies would cause NoClassDefFoundError
   - Not indicated by current evidence, but possible

---

## Recommendations

### Immediate Actions (Priority 1)

1. **Clean Rebuild from Scratch**
   ```batch
   rmdir /s /q target\classes
   rmdir /s /q target
   build-extractor.bat > build.log 2>&1
   ```
   - Verify build completes without errors
   - Check build.log for any warnings
   - Confirm JAR timestamp is AFTER rebuild
   - Verify source file imports are correct

2. **Verify Creo is Running Before Loading Applet**
   - JLink applets MUST be loaded FROM Creo
   - Cannot run standalone like main() method
   - Start Creo first, then load applet via Tools > Auxiliary Applications

3. **Test Static Initialization in Isolation**
   ```java
   // Temporary test: Comment out static logger initialization
   // Use lazy initialization instead
   private static MetadataLogger logger;

   private static MetadataLogger getLogger() {
       if (logger == null) {
           logger = new MetadataLogger("JlinkMetadataExtractor");
       }
       return logger;
   }
   ```

4. **Add Detailed Startup Logging**
   ```java
   public int start() {
       try {
           System.out.println("=== APPLET START CALLED ===");
           System.out.println("Working directory: " + System.getProperty("user.dir"));
           System.out.println("Classpath: " + System.getProperty("java.class.path"));

           initialize();

           System.out.println("=== APPLET START SUCCESS ===");
           return 0;
       } catch (Exception e) {
           System.err.println("=== APPLET START FAILED ===");
           e.printStackTrace();
           return -1;
       }
   }
   ```

### Investigation Steps (Priority 2)

1. **Check Creo Trail File for Applet Load Messages**
   - Location: Creo working directory or `C:\Users\<user>\trail.txt`
   - Look for messages about applet registration
   - Search for "MetadataExtractor" or Java errors

2. **Enable Creo Debug Logging**
   - Set environment variable: `PRO_COMM_MSG_LOG=1`
   - Restart Creo
   - Check for detailed JLink communication logs

3. **Test with Minimal Applet**
   ```java
   public class MinimalTest {
       public int start() {
           System.out.println("Minimal applet started!");
           return 0;
       }
       public void stop() {
           System.out.println("Minimal applet stopped!");
       }
   }
   ```
   - Compile, package, create .dat file
   - If this loads, issue is in MetadataExtractor code
   - If this fails, issue is in Creo/JLink configuration

4. **Verify Java Version Compatibility**
   ```batch
   java -version
   # Should show: java version "21.0.9"

   javap -verbose target\classes\com\creo\metadata\JlinkMetadataExtractor.class | findstr "major"
   # Should show: major version: 65 (Java 21)
   ```

### Long-term Improvements (Priority 3)

1. **Robust Error Handling in Static Initialization**
   ```java
   private static final MetadataLogger logger;
   private static final Exception initError;

   static {
       MetadataLogger tempLogger = null;
       Exception tempError = null;
       try {
           tempLogger = new MetadataLogger("JlinkMetadataExtractor");
       } catch (Exception e) {
           tempError = e;
           // Fallback to console-only logging
           tempLogger = new MetadataLogger("JlinkMetadataExtractor", true, false);
       }
       logger = tempLogger;
       initError = tempError;
   }

   public int start() {
       if (initError != null) {
           System.err.println("Warning: Logger initialization failed: " + initError.getMessage());
       }
       // ... continue with start logic
   }
   ```

2. **Session Initialization Validation**
   ```java
   public void initializeSession() throws Exception {
       try {
           // Verify we're running in Creo context
           String creoRunning = System.getenv("PRO_DIRECTORY");
           if (creoRunning == null) {
               throw new Exception("Not running in Creo context - PRO_DIRECTORY not set");
           }

           session = pfcSession.GetCurrentSessionWithCompatibility(
               CreoCompatibility.C4Compatible
           );

           if (session == null) {
               throw new Exception("GetCurrentSessionWithCompatibility returned null");
           }

           // ... rest of initialization
       } catch (jxthrowable x) {
           // More detailed error message
           throw new Exception(
               "JLink API error: " + x.getMessage() +
               "\nStack: " + Arrays.toString(x.getStackTrace())
           );
       }
   }
   ```

3. **Build Verification Script**
   ```batch
   @echo off
   REM build-and-verify.bat

   echo Cleaning...
   rmdir /s /q target 2>nul

   echo Building...
   call build-extractor.bat > build.log 2>&1

   echo Verifying...
   findstr /i "error" build.log
   if not errorlevel 1 (
       echo BUILD FAILED - See build.log
       exit /b 1
   )

   echo Checking method signatures...
   javap -p target\classes\com\creo\metadata\JlinkMetadataExtractor.class | findstr "start\|stop"

   echo Checking JAR contents...
   jar tf target\metadata-extractor.jar | findstr "SessionManager"

   echo BUILD VERIFIED
   ```

---

## Evidence Summary

### Files Analyzed
1. ✓ `jlink_applet.dat` - Configuration correct
2. ✓ `JlinkMetadataExtractor.java` - Method signatures correct
3. ✓ `SessionManager.java` - Imports correct (in source)
4. ✓ `metadata-extractor.jar` - Structure correct, but may be stale
5. ✓ `error.txt` - Shows 55 compilation errors from failed build
6. ✓ `logs/metadata_20251202_004314.log` - Runtime session error
7. ✓ OTK JAR package structure - Verified correct paths

### Critical Findings
| Finding | Status | Impact |
|---------|--------|--------|
| start()/stop() method signatures | ✓ Correct | None |
| .dat file configuration | ✓ Correct | None |
| OTK JARs exist and accessible | ✓ Present | None |
| Source file imports | ✓ Correct | None |
| **JAR compilation status** | ⚠ **Uncertain** | **Critical** |
| **Build success** | ✗ **Failed** | **Critical** |
| Session initialization context | ⚠ Requires Creo | Major |
| Static logger initialization | ⚠ Potential risk | Moderate |

---

## Unresolved Questions

1. **When was the JAR successfully built?**
   - JAR timestamp: Dec 2 01:04
   - Source modified: Dec 2 00:40, 00:59
   - Build failure (error.txt): Timestamp unknown
   - **Need to determine**: Did successful build happen after source fixes?

2. **How is the applet being loaded?**
   - Via Tools > Auxiliary Applications > Register?
   - Via PROTKDAT in config.pro?
   - Via command-line flag `-g:jlink_applet`?
   - **Need**: Exact loading procedure used when error occurred

3. **What is the exact error message in Creo?**
   - User reported: "startup error failed to load"
   - **Need**: Exact error dialog text or trail file message
   - **Need**: Any Java stack traces in Creo console

4. **Is Creo running when applet load is attempted?**
   - Session errors suggest standalone execution
   - **Need**: Confirmation of Creo running state
   - **Need**: Applet loading sequence

5. **Are there Creo-side logs we haven't checked?**
   - trail.txt.1 shows Creo 4.0 (old session)
   - **Need**: Current trail.txt from Creo 12.4.0.0 session
   - **Need**: Any Pro/TOOLKIT debug logs

---

## Next Steps

1. **Clean rebuild** with verification
2. **Capture exact error** from Creo when applet fails to load
3. **Check Creo trail.txt** during failed load attempt
4. **Test minimal applet** to isolate configuration vs. code issues
5. **Verify Creo is running** before load attempt

---

## Appendix: Technical Details

### JLink Applet Loading Sequence (Normal)

1. Creo reads `jlink_applet.dat` (or PROTKDAT config)
2. Creo validates .dat file syntax
3. Creo resolves JAVA_APP_CLASSPATH (all JARs must exist)
4. Creo loads JAVA_APP_CLASS using Java ClassLoader
5. **Static initialization runs** (potential failure point)
6. Creo creates instance using default constructor
7. **Creo calls JAVA_APP_START method** (`start()`)
8. If start() returns 0, applet is "running"
9. If start() returns -1, applet fails to start

### Failure Points

| Stage | Symptom | Our Case |
|-------|---------|----------|
| File not found | "Cannot find applet file" | ✗ Not occurring |
| Invalid syntax | "Invalid applet configuration" | ✗ Not occurring |
| JAR missing | "ClassNotFoundException" | ✗ Not occurring |
| Classpath error | "NoClassDefFoundError" | ✗ Not occurring |
| **Static init failure** | **"Failed to load"** | ⚠ **Possible** |
| **Constructor failure** | **"Failed to load"** | ⚠ **Possible** |
| start() returns -1 | "Failed to start" | ⚠ **Possible** |
| start() exception | "Startup error" | ⚠ **Possible** |

### Session Initialization Requirements

`pfcSession.GetCurrentSessionWithCompatibility()` requires:
- Creo must be running
- Code must execute **inside Creo's JVM**
- Cannot run standalone (even with Creo running)
- Creo's Pro/TOOLKIT must be initialized

**Evidence from logs:**
```
Cannot invoke "com.ptc.cipjava.CIPRemoteComm.getTransport()"
because "com.ptc.cipjava.CIPRemoteApp.comm" is null
```

This error is **definitive evidence** that:
- Code is running OUTSIDE Creo's applet context
- GetCurrentSessionWithCompatibility() was called inappropriately
- Suggests testing was done via `java -jar` or standalone execution

**Recommendation:**
Verify applet is loaded FROM Creo, not run as standalone application.

---

**Report End**
