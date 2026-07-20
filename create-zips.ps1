# Stage Frontend
if (Test-Path temp_fe) { Remove-Item temp_fe -Recurse -Force }
New-Item -ItemType Directory -Path temp_fe | Out-Null
Copy-Item -Path frontend/dist -Destination temp_fe/dist -Recurse
Copy-Item -Path frontend/server.js -Destination temp_fe/server.js
$pkg = @{ name='sarathi-ai-frontend'; version='1.0.0'; type='module'; scripts=@{start='node server.js'}; dependencies=@{express='^4.21.2'} } | ConvertTo-Json
[System.IO.File]::WriteAllText("$PWD/temp_fe/package.json", $pkg)

if (Test-Path sarathi-frontend-deploy-v3-clean.zip) { Remove-Item sarathi-frontend-deploy-v3-clean.zip }
Compress-Archive -Path temp_fe/* -DestinationPath sarathi-frontend-deploy-v3-clean.zip -Force
Remove-Item temp_fe -Recurse -Force
Write-Host 'Frontend v3 clean zip created successfully!'

# Stage Backend
if (Test-Path temp_be) { Remove-Item temp_be -Recurse -Force }
New-Item -ItemType Directory -Path temp_be | Out-Null
Copy-Item -Path backend/src -Destination temp_be/src -Recurse
Copy-Item -Path backend/.node-version -Destination temp_be/.node-version
Copy-Item -Path backend/Procfile -Destination temp_be/Procfile
Copy-Item -Path backend/package.json -Destination temp_be/package.json

if (Test-Path sarathi-eb-deploy-v15-fixed.zip) { Remove-Item sarathi-eb-deploy-v15-fixed.zip }
Compress-Archive -Path temp_be/* -DestinationPath sarathi-eb-deploy-v15-fixed.zip -Force
Remove-Item temp_be -Recurse -Force
Write-Host 'Backend v15 zip created successfully!'
