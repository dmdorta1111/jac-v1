#-----------------------------------------------------------------------------------------------------------------------------
$pfd = '*.pdf'
$mo = '_'
$pso = 'PSObject'
$lo = '-'
$promo = '\ProE Models\'
$io = '\'
$path = $args[0]
$rt = 'REQ.JSON'
$reqq = $path + $io + $rt 
#-----------------------------------------------------------------------------------------------------------------------------
function Get-PDFDrawings
{
  <#
    .SYNOPSIS
   Collect all PDF from folder 
  #>

  param
  (
    [Parameter(Mandatory=$true, ValueFromPipeline=$true, HelpMessage='Data to process')]
    [Object]$InputObject
  )
  process
  {
     $name = 'pdf'+$ind
  Add-Member -InputObject $pdf -Name $name -MemberType NoteProperty -Value $InputObject.FullName -Force
 ++$ind
  }
}
#-----------------------------------------------------------------------------------------------------------------------------
function Print-Pdf
{
Param
(
[Parameter(Mandatory=$true,Position=0,ValueFromPipelineByPropertyName=$true)]
[ValidateScript({Test-Path -Path $_ -PathType Leaf})]
[ValidatePattern('.*\.pdf$')]
[string] $PDF
)

Process
{
if(!($PsBoundParameters.ContainsKey('PDF'))){ $PDF = $_ }
Start-Process -FilePath $PDF -Verb Print -PassThru | ForEach-Object{ Start-Sleep -Seconds 10
$_ } | Stop-Process
}
}
#-----------------------------------------------------------------------------------------------------------------------------
$reqd = Get-Content -Path $reqq | ConvertFrom-Json
$userR = $reqd.user_req
$passwordR = $reqd.user_pwd
$computernameR = $reqd.comp_nm
$sonum = $reqd.so_num 
$choice = $reqd.choice
$wonum = $reqd.wo_num
$wonum = '00'+$wonum
$choice1 = $reqd.choice1
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
do
{
    $excel = Get-Process -Name 'EXCEL' 
    Start-Sleep -Seconds 20
}
while ($excel.HasExited -eq $False)
#-----------------------------------------------------------------------------------------------------------------------------
$test = $connection.IsRunning()
  If($test -eq $False) {
    $date = Get-Date
    $text = $date +' '+ $path 
    Set-Content -Path 'Y:\ENGINEERING PERSONNEL\DJ\LOG\file.txt' -Value $text  
    Restart-Computer -Force 
  }
$connection.End()
$tfile = $path + $io + 'text.txt' 
$rfile = $path + $io + $rt 
Remove-Item -Path $tfile -Force
Remove-Item -path $rfile -force
#-----------------------------------------------------------------------------------------------------------------------------
If($choice -eq '5'){
Get-ChildItem -Path $path -Recurse -Filter '*.log' | Remove-Item   
Get-ChildItem -Path $path -Recurse -Filter '*.log.1' | Remove-Item 
$dir = $path + $promo + $sonum + $lo + $wonum
$dir3 = $dir + $io + $sonum + $lo + $wonum
Get-ChildItem -Path $dir3 -Recurse -Include *.pdf | ForEach-Object{ Print-Pdf -PDF $_.FullName }
}
#-----------------------------------------------------------------------------------------------------------------------------
If($choice -eq '8'){
$dir1 = $path + '\Customer Drawings'
$out1 = $dir1 + $io + $sonum + $mo + 'Customer_Drawings.pdf'
$pdf = New-Object -TypeName $pso 
$ind = 1
Get-ChildItem -Path $dir1 -Filter $pfd | Get-PDFDrawings  
Merge-PDF -InputFile $pdf.pdf1, $pdf.pdf2, $pdf.pdf3, $pdf.pdf4, $pdf.pdf5, $pdf.pdf6, $pdf.pdf7, $pdf.pdf8, $pdf.pdf9, $pdf.pdf10, $pdf.pdf11, $pdf.pdf12, $pdf.pdf13, $pdf.pdf14, $pdf.pdf15, $pdf.pdf16, $pdf.pdf17, $pdf.pdf18, $pdf.pdf19, $pdf.pdf20, $pdf.pdf21, $pdf.pdf22, $pdf.pdf23, $pdf.pdf24 -OutputFile $out1 
}
#-----------------------------------------------------------------------------------------------------------------------------
$secstr = New-Object -TypeName System.Security.SecureString
$passwordR.ToCharArray() | ForEach-Object {$secstr.AppendChar($_)}
$cred = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $userR, $secstr
$Sesh = New-PSSession -ComputerName $computernameR -Credential $cred 
Copy-Item -Path $path -Recurse -Destination 'C:\000_SDI' -ToSession $Sesh -Force
#-----------------------------------------------------------------------------------------------------------------------------
If($choice1 -eq '2'){ 
$sn = $sonum.ToString()
$sa = $sn.SubString(0,2)
$xdir = Get-ChildItem -Path 'X:\' | Where-Object {$_.Name.StartsWith($sa) -eq $true}
$xdirr = $xdir.FullName
Copy-Item -Path $dir3 -Recurse -Destination $xdirr -Force
#-----------------------------------------------------------------------------------------------------------------------------
$wonum = $wonum.ToString()
$wodir = $sn + $lo + $wonum 
$xdfdir = $xdirr + $io + $wodir
$wol = $sn + $lo + $wonum + '.wol'
$xdfdirC = $xdfdir + $io + $wol
PsExec.exe \\$env:computername -i -d 'C:\Program Files (x86)\SigmaTEK\SigmaNESTX1\SigmaNEST.exe' $xdfdirC
Start-Sleep -Seconds 60 
Get-Process -Name SigmaNEST | Foreach-Object {$null = $_.CloseMainWindow() } | stop-process
}
#-----------------------------------------------------------------------------------------------------------------------------
Remove-Item -Path $path -Recurse -Force 
#-----------------------------------------------------------------------------------------------------------------------------

# SIG # Begin signature block
# MIIDzwYJKoZIhvcNAQcCoIIDwDCCA7wCAQExCzAJBgUrDgMCGgUAMGkGCisGAQQB
# gjcCAQSgWzBZMDQGCisGAQQBgjcCAR4wJgIDAQAABBAfzDtgWUsITrck0sYpfvNR
# AgEAAgEAAgEAAgEAAgEAMCEwCQYFKw4DAhoFAAQUMWholhtozN3iJq5Baw377aSo
# 5M6gggHzMIIB7zCCAVigAwIBAgIQTWKGJAybY7tNRDOkd+xctjANBgkqhkiG9w0B
# AQUFADASMRAwDgYDVQQDDAdkYXZpZGpyMB4XDTIwMDIyNTAyMjAwNVoXDTI0MDIy
# NTAwMDAwMFowEjEQMA4GA1UEAwwHZGF2aWRqcjCBnzANBgkqhkiG9w0BAQEFAAOB
# jQAwgYkCgYEAnfNy3CO1K86QSzvG3B45dSFjGcxAOPV0qq/OawR/NTNqgvqB2lmr
# wPhKHBLVIEJOBb46an39Hwo7Fp40mJI3F1tNkZX2ZuOTW/IHted3egPexL62X3wL
# v25fFGnHv7jqArM5AhrdixqfUhfqphAY8ejX1iLlgq++sQ97umci4L0CAwEAAaNG
# MEQwEwYDVR0lBAwwCgYIKwYBBQUHAwMwHQYDVR0OBBYEFPaG6ZV7YPbKEcRntp/u
# 1vPypMUxMA4GA1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQUFAAOBgQAvbg9B+hY8
# oKq5FxHRaN7LI2r+tZD+mnuGE064ep0I9Jw4b9WIiWS1g8mly1t33WRNk2+aZK0s
# rZeCFjdOW4RvEcWfsYGcK5aDYX62j+B6VH4cwpSbabaDvg/YEH+FnH8/1Be1Uclv
# PJj4hoxA2NEW05DOpFk4dKFjxpkGsOycBDGCAUYwggFCAgEBMCYwEjEQMA4GA1UE
# AwwHZGF2aWRqcgIQTWKGJAybY7tNRDOkd+xctjAJBgUrDgMCGgUAoHgwGAYKKwYB
# BAGCNwIBDDEKMAigAoAAoQKAADAZBgkqhkiG9w0BCQMxDAYKKwYBBAGCNwIBBDAc
# BgorBgEEAYI3AgELMQ4wDAYKKwYBBAGCNwIBFTAjBgkqhkiG9w0BCQQxFgQU77CQ
# BOqbqa0EL3XGYNS8SfjpWF4wDQYJKoZIhvcNAQEBBQAEgYBCwdUaZgmes7VSeEJo
# X5GStRMrDuTF9ak58/5QwA8AOUhCyhYnoBKDXf+2bFrVguX7Q3K/FcBKseidi7A4
# Fi1mwzcd4mk4QhhlYj3F8NKusZuxvT6S1WzrckVE0+NUaevdLhS0+AzGde+Nz2rS
# H4xrqcwPddg/eYQ+atAp/rIkZA==
# SIG # End signature block
