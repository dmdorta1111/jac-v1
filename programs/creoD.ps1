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

$async = New-Object -ComObject pfcls.pfcAsyncConnection
$connection = $async.Start('C:\\Program Files\\ptc\\Creo 3.0\\M190\\Parametric\\bin\\parametric.exe', '.')
$session = $connection.Session
$session.SetConfigOption('auto_traceback', 'never')
Start-Sleep -Seconds 5
$session.ChangeDirectory($path)
Start-Sleep -Seconds 5
$wshell = New-Object -ComObject wscript.shell
$wshell.AppActivate('Creo Parametric')
Start-Sleep -Seconds 1
$wshell.SendKeys('zx')
Start-Sleep -Seconds 20

#-----------------------------------------------------------------------------------------------------------------------------
