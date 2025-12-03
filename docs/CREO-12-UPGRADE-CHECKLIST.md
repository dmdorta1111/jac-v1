# Creo 12 Upgrade Checklist for JLink Extractor

**Project:** JAC-V1 / JLink Metadata Extractor
**Target:** Creo 12.4.0.0 Compatibility
**Java Requirement:** Java 21 (mandatory)

---

## Pre-Upgrade Planning

- [ ] **Backup current setup**
  - [ ] Backup `build-extractor.bat`
  - [ ] Backup `build-extractor.sh`
  - [ ] Backup `run-extractor.bat`
  - [ ] Backup `src/` directory
  - [ ] Git commit current state

- [ ] **Inventory current environment**
  - [ ] Document current Java version: `java -version`
  - [ ] Document current Creo version
  - [ ] List any custom protk.dat configurations
  - [ ] Check for any Java-specific code in project

- [ ] **Review project documentation**
  - [ ] Read: `README_JLINK_EXTRACTOR.md`
  - [ ] Read: `SETUP_GUIDE.md`
  - [ ] Check: `JLINK_EXTRACTOR_SUMMARY.md`
  - [ ] Note any Java 11-specific code

---

## Phase 1: Environment Setup

### 1.1 Install Java 21

- [ ] **Option A: Oracle Java 21 (Recommended)**
  ```bash
  # Download from: https://www.oracle.com/java/technologies/downloads/
  # Select: JDK 21 → Windows x64 Installer (or your OS)
  # Run installer, accept defaults
  # Verify:
  java -version
  # Expected output: java version "21.0.x"
  ```

- [ ] **Option B: Amazon Corretto OpenJDK 21**
  ```bash
  # Download from: https://aws.amazon.com/corretto/
  # Run installer
  # Set environment variable:
  # Windows: setx PRO_JAVA_COMMAND "C:\Program Files\Amazon Corretto\jdk21.0.x_yyyy\bin\java.exe"
  # Linux/Mac: export PRO_JAVA_COMMAND=/usr/lib/jvm/amazon-corretto-21-x64/bin/java
  # Verify:
  echo %PRO_JAVA_COMMAND%
  ```

- [ ] **Verify Java 21 Installation**
  ```bash
  java -version
  javac -version
  # Both should report Java 21.0.x
  ```

- [ ] **Remove or keep Java 11** (optional)
  ```bash
  # Java 11 can remain if you need Creo 11 support
  # Just ensure Java 21 is default:
  java -version
  # Should show Java 21, not Java 11
  ```

### 1.2 Install Creo 12.4.0.0

- [ ] **Download Creo 12.4.0.0**
  - [ ] Get installer from PTC portal
  - [ ] Verify checksum if provided

- [ ] **Run Creo 12 Installer**
  - [ ] Select "Custom Installation"
  - [ ] **IMPORTANT:** Select "API Toolkits" > "Creo Object Toolkit Java and J-Link"
  - [ ] Complete installation
  - [ ] Note installation directory (e.g., `C:\Program Files\PTC\Creo 12.0`)

- [ ] **Verify Creo 12 Installation**
  ```bash
  # Check OTK directories exist:
  dir "C:\Program Files\PTC\Creo 12.0\Common Files\otk\otk_java"
  dir "C:\Program Files\PTC\Creo 12.0\Common Files\otk_java_free"

  # Should see: otk.jar, pfc.jar, etc.
  ```

- [ ] **Launch Creo 12 once**
  - [ ] Ensure it starts without errors
  - [ ] Check that Java 21 is used (no Java version dialogs)
  - [ ] Exit Creo

---

## Phase 2: Project Code Updates

### 2.1 Update Build Scripts

- [ ] **Edit `build-extractor.bat`**
  ```batch
  REM Change Java detection to require Java 21:

  REM OLD (for Java 11):
  REM for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| find "version"') do set JAVA_VERSION=%%g

  REM NEW (for Java 21):
  for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| find "version"') do set JAVA_VERSION=%%g

  REM Add check:
  if not "%JAVA_VERSION%"=="21.0.x" (
    echo ERROR: Java 21 required. Current: %JAVA_VERSION%
    exit /b 1
  )
  ```

- [ ] **Edit `build-extractor.sh`**
  ```bash
  # Change similar check for Linux/Mac:
  JAVA_VERSION=$(java -version 2>&1 | grep 'version' | awk '{print $3}')

  if [[ ! $JAVA_VERSION =~ ^21\. ]]; then
    echo "ERROR: Java 21 required. Current: $JAVA_VERSION"
    exit 1
  fi
  ```

- [ ] **Update Creo path detection**
  ```batch
  REM Find Creo 12 installation:
  REM Change from: "C:\Program Files\PTC\Creo 11.0"
  REM Change to:   "C:\Program Files\PTC\Creo 12.0"
  REM OR: Auto-detect latest version
  ```

- [ ] **Verify OTK.jar path**
  ```batch
  REM Update to use Creo 12 paths:
  set OTK_JAR=C:\Program Files\PTC\Creo 12.0\Common Files\text\java\otk.jar
  ```

### 2.2 Review Java Source Code

- [ ] **Check for Java version-specific features**
  - [ ] Search for `System.getProperties()`
  - [ ] Search for deprecated method usage
  - [ ] Search for reflective code that might be sensitive to Java version
  - [ ] Search for hardcoded class paths

- [ ] **Update `pom.xml` or `build.gradle` (if applicable)**
  ```xml
  <!-- If using Maven -->
  <source>11</source>    →  <source>21</source>
  <target>11</target>    →  <target>21</target>
  ```

- [ ] **Test compilation with Java 21**
  ```bash
  # Navigate to project directory
  cd C:\Users\waveg\VsCodeProjects\jac-v1

  # Run build script
  build-extractor.bat

  # Check for compilation errors
  # Expected: target/metadata-extractor.jar should be created
  ```

- [ ] **Verify JAR file created**
  ```bash
  dir target\metadata-extractor.jar
  # File size should be > 0 KB
  ```

### 2.3 Update Creo Launch Configuration

- [ ] **Check protk.dat (if used)**
  - [ ] Location of protk.dat file
  - [ ] Verify `java_app_classpath` points to Creo 12 OTK
  - [ ] No changes needed to file format
  - [ ] Example correct path:
    ```
    java_app_classpath C:\Program Files\PTC\Creo 12.0\Common Files\text\java\pfc.jar;C:\Project\lib\metadata-extractor.jar;.
    ```

- [ ] **Check config.pro (if custom)**
  - [ ] Verify no Java 11-specific options
  - [ ] If using Amazon Corretto, ensure `PRO_JAVA_COMMAND` is set
  - [ ] Example:
    ```
    protkdat "C:\Program Files\PTC\Creo 12.0\Common Files\protk.dat"
    ```

---

## Phase 3: Testing

### 3.1 Unit Testing

- [ ] **Test basic Creo 12 connectivity**
  ```bash
  # Run the simple install_test from Creo 12:
  cd "C:\Program Files\PTC\Creo 12.0\Common Files\otk_java_free\install_test"
  # Follow installation instructions
  # Should connect to Creo 12 without errors
  ```

- [ ] **Test JLink extractor with small dataset**
  ```bash
  REM Create test directory:
  mkdir C:\TestModels_Creo12

  REM Copy 1-2 simple test models:
  REM (Use simple parts, not complex assemblies)

  REM Run extractor:
  run-extractor.bat "C:\TestModels_Creo12"

  REM Check results:
  dir C:\TestModels_Creo12\*_metadata.md
  ```

- [ ] **Verify metadata output**
  - [ ] Check generated `.md` files exist
  - [ ] Open one with text editor
  - [ ] Verify content is correct:
    - [ ] Model information populated
    - [ ] Parameters extracted
    - [ ] Features listed
    - [ ] No error messages

### 3.2 Integration Testing

- [ ] **Test with medium assembly (5-10 parts)**
  ```bash
  REM Run on larger test:
  run-extractor.bat "C:\SmartAssembly_Test"

  REM Monitor:
  # Watch console output for errors
  # Check memory usage (shouldn't exceed 2GB)
  # Verify all models processed
  ```

- [ ] **Check error handling**
  - [ ] Test with missing referenced models
  - [ ] Test with corrupted model file
  - [ ] Verify error logging works
  - [ ] Check that batch continues on non-critical errors

- [ ] **Test logging**
  - [ ] Review log output directory
  - [ ] Verify logs contain expected entries
  - [ ] Check for any warning messages

### 3.3 Performance Testing

- [ ] **Benchmark against Creo 11 baseline**
  ```bash
  # Test same models in both Creo 11 and Creo 12:
  # Record: time, memory, errors
  ```

- [ ] **Monitor resources**
  - [ ] CPU usage during extraction
  - [ ] Memory usage (heap size)
  - [ ] Disk I/O
  - [ ] Compare to previous results

### 3.4 Compatibility Testing

- [ ] **Test with actual project models**
  - [ ] Run on `SmartAssembly\Library_New`
  - [ ] Verify all metadata extracted correctly
  - [ ] Check for any new/deprecated features

- [ ] **Test with different Creo sessions**
  - [ ] Test while Creo 12 open with different models
  - [ ] Test with Creo minimized
  - [ ] Test with Creo in background

---

## Phase 4: Documentation Updates

### 4.1 Update README Files

- [ ] **Update `README_JLINK_EXTRACTOR.md`**
  ```markdown
  # Change:
  Java Version: 11 → Java Version: 21
  Creo Version: 11.0 → Creo Version: 12.4.0.0

  # Add section:
  ## Java 21 Installation
  [Instructions...]
  ```

- [ ] **Update `SETUP_GUIDE.md`**
  - [ ] Update Java installation section
  - [ ] Update Creo installation step
  - [ ] Update verification commands
  - [ ] Add troubleshooting for Java 21

- [ ] **Update `JLINK_EXTRACTOR_SUMMARY.md`**
  - [ ] Update Java version requirement
  - [ ] Note Creo 12.4 compatibility
  - [ ] Document migration path

### 4.2 Add Migration Guide

- [ ] **Create `CREO-12-MIGRATION.md`**
  - [ ] Step-by-step upgrade instructions
  - [ ] Rollback procedures (if needed)
  - [ ] Troubleshooting guide
  - [ ] Performance comparison (Creo 11 vs 12)

### 4.3 Update Build Scripts Documentation

- [ ] **Document new build prerequisites**
  - [ ] Java 21 requirement
  - [ ] Creo 12.4.0.0 (with API Toolkits)
  - [ ] Supported platforms

- [ ] **Document new environment variables**
  - [ ] `JAVA_HOME` (if using Oracle)
  - [ ] `PRO_JAVA_COMMAND` (if using Amazon Corretto)
  - [ ] `CREO_HOME` or similar

---

## Phase 5: Deployment

### 5.1 Staging Deployment

- [ ] **Deploy to test/staging environment**
  - [ ] Install Java 21
  - [ ] Install Creo 12.4.0.0
  - [ ] Deploy updated JLink extractor
  - [ ] Run full integration tests
  - [ ] Collect performance metrics
  - [ ] Get stakeholder approval

### 5.2 Production Deployment

- [ ] **Production rollout plan**
  - [ ] Schedule: Agreed maintenance window
  - [ ] Backup: Existing data backed up
  - [ ] Rollback: Procedure documented and tested
  - [ ] Monitoring: Metrics collection enabled

- [ ] **Production deployment steps**
  1. [ ] Stop JLink extractor if running
  2. [ ] Install Java 21 (or update if present)
  3. [ ] Upgrade Creo to 12.4.0.0
  4. [ ] Deploy updated JAR file
  5. [ ] Run smoke tests
  6. [ ] Monitor first few runs
  7. [ ] Full production use

- [ ] **Post-deployment validation**
  - [ ] Verify all models extract correctly
  - [ ] Check metadata output quality
  - [ ] Monitor for errors/warnings
  - [ ] Compare metrics to staging

### 5.3 Documentation

- [ ] **Create runbook for operations team**
  - [ ] How to run extractor
  - [ ] How to troubleshoot
  - [ ] Where to find logs
  - [ ] Who to contact for issues

- [ ] **Archive old documentation**
  - [ ] Keep Creo 11 setup guides
  - [ ] Mark as "deprecated" or "legacy"
  - [ ] Reference new Creo 12 guides

---

## Phase 6: Rollback Plan (If Needed)

- [ ] **Keep Creo 11 installation separate**
  - [ ] Don't remove Creo 11 immediately
  - [ ] Keep separate Java 11 installation
  - [ ] Allow 1-2 weeks monitoring before removal

- [ ] **Rollback procedure**
  ```bash
  # If critical issues found:
  1. Revert to Creo 11 installation
  2. Recompile with Java 11 (from backup)
  3. Restore previous JAR file
  4. Restart extractor
  ```

- [ ] **Communication plan**
  - [ ] Who to notify if rollback needed
  - [ ] Timeline for communicating status
  - [ ] Escalation procedure

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| "Java 21 not found" | Run `java -version`, verify installation, check PATH |
| "otk.jar not found" | Check Creo 12 installation included API Toolkits |
| "Unable to connect to Creo" | Ensure Creo 12 running, restart if needed |
| "ClassCastException" | Recompile all source with Java 21 |
| "Old OTK.jar error" | Delete incorrect JAR, verify Creo 12 otk.jar present |
| Performance degradation | Monitor heap size, increase if needed: `-Xmx8g` |
| Script won't run | Check file permissions, run as Administrator |

---

## Sign-Off

- [ ] **Technical Review**
  - Developer: _________________ Date: _______
  - QA: _________________ Date: _______

- [ ] **Stakeholder Approval**
  - Project Lead: _________________ Date: _______
  - Operations: _________________ Date: _______

---

## Notes

```
[Use this section to record any issues, decisions, or notes during upgrade]

Example:
- 2025-12-02: Java 21 installed successfully
- 2025-12-02: Creo 12.4.0.0 installed with API Toolkits
- 2025-12-02: Initial build test passed
- [Add more as you progress...]
```

---

**Status:** Ready for implementation
**Estimated Time:** 4-6 hours (including testing)
**Risk Level:** Low (well-documented, backward compatible)

