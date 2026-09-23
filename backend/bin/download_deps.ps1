param(
    [string]$BinDir = "$PSScriptRoot"
)

# Downloads FFmpeg essentials build and copies ffmpeg.exe / ffprobe.exe into backend/bin/.
# yt-dlp.exe is already bundled in this folder.

$ffmpegZip = Join-Path $BinDir "ffmpeg.zip"
$url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

Write-Host "Downloading FFmpeg from $url ..."
curl.exe -L $url -o $ffmpegZip
if ($LASTEXITCODE -ne 0) {
    Write-Error "FFmpeg download failed (exit code $LASTEXITCODE)."
    exit 1
}

# Validate the archive before extracting to catch truncated downloads
Add-Type -AssemblyName System.IO.Compression.FileSystem
try {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($ffmpegZip)
    $zip.Dispose()
} catch {
    Write-Error "Downloaded archive is corrupted (incomplete download?). Delete ffmpeg.zip and re-run."
    Remove-Item -Force $ffmpegZip -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Extracting FFmpeg..."
Expand-Archive -Path $ffmpegZip -DestinationPath "$BinDir\ffmpeg_temp" -Force

$extractedDir = Get-ChildItem -Path "$BinDir\ffmpeg_temp" | Select-Object -First 1
Copy-Item "$($extractedDir.FullName)\bin\ffmpeg.exe" -Destination "$BinDir\ffmpeg.exe" -Force
Copy-Item "$($extractedDir.FullName)\bin\ffprobe.exe" -Destination "$BinDir\ffprobe.exe" -Force

Remove-Item -Recurse -Force "$BinDir\ffmpeg_temp", $ffmpegZip
Write-Host "FFmpeg installation complete!"
