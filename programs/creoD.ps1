#-----------------------------------------------------------------------------------------------------------------------------
# creoD.ps1 - Creo Parametric Automation Script
# Usage: .\creoD.ps1 <full-path-to-project-directory>
# Example: .\creoD.ps1 "C:\Users\dmdor\VsCode\jac-anti\jac-v1\project-docs\SDI\33333"
#-----------------------------------------------------------------------------------------------------------------------------

# Input argument - full path to project directory inside project-docs folder
$path = $args[0]

# Validate path argument
if (-not $path) {
    Write-Error "Error: Path argument is required."
    Write-Host "Usage: .\creoD.ps1 <full-path-to-project-directory>"
    Write-Host 'Example: .\creoD.ps1 "C:\Users\dmdor\VsCode\jac-anti\jac-v1\project-docs\SDI\33333"'
    exit 1
}

if (-not (Test-Path -Path $path -PathType Container)) {
    Write-Error "Error: Directory does not exist: $path"
    exit 1
}

#-----------------------------------------------------------------------------------------------------------------------------
# Creo Parametric COM Automation
#-----------------------------------------------------------------------------------------------------------------------------

try {
    Write-Host "creoD.ps1: Starting Creo Parametric automation..."
    Write-Host "creoD.ps1: Project directory: $path"

    # Create COM connection to Creo
    Write-Host "creoD.ps1: Creating pfcAsyncConnection COM object..."
    $async = New-Object -ComObject pfcls.pfcAsyncConnection
    if (-not $async) {
        throw "Failed to create pfcls.pfcAsyncConnection COM object. Is Creo installed?"
    }

    # Start Creo Parametric
    Write-Host "creoD.ps1: Starting Creo Parametric executable..."
    $connection = $async.Start('C:\\Program Files\\PTC\\Creo 3.0\\M190\\Parametric\\bin\\parametric.exe', '.')
    if (-not $connection) {
        throw "Failed to start Creo Parametric. Check installation path."
    }

    # Get session
    Write-Host "creoD.ps1: Getting Creo session..."
    $session = $connection.Session
    if (-not $session) {
        throw "Failed to get Creo session object."
    }

    # Configure session
    Write-Host "creoD.ps1: Configuring session options..."
    $session.SetConfigOption('auto_traceback', 'never')
    Start-Sleep -Seconds 5

    # Change to project directory
    Write-Host "creoD.ps1: Changing directory to: $path"
    $session.ChangeDirectory($path)
    Start-Sleep -Seconds 5

    # Activate Creo window and send keystrokes
    Write-Host "creoD.ps1: Activating Creo window..."
    $wshell = New-Object -ComObject wscript.shell
    $activated = $wshell.AppActivate('Creo Parametric')
    if (-not $activated) {
        Write-Host "creoD.ps1: WARNING - Could not activate Creo Parametric window"
    }
    Start-Sleep -Seconds 1

    Write-Host "creoD.ps1: Sending keystrokes 'zx'..."
    $wshell.SendKeys('zx')
    Start-Sleep -Seconds 20

    Write-Host "creoD.ps1: SUCCESS - Creo Parametric automation completed"
    exit 0
}
catch {
    $errorMessage = $_.Exception.Message
    $errorLine = $_.InvocationInfo.ScriptLineNumber
    Write-Error "creoD.ps1: ERROR at line $errorLine - $errorMessage"
    Write-Host "creoD.ps1: FAILED - $errorMessage"

    # Log stack trace for debugging
    if ($_.Exception.StackTrace) {
        Write-Host "creoD.ps1: Stack trace: $($_.Exception.StackTrace)"
    }

    exit 1
}

#-----------------------------------------------------------------------------------------------------------------------------
