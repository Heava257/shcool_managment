try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/categories" -Method GET -ContentType "application/json"
    Write-Host "Categories:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:"
    $_.Exception.Message
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/brands" -Method GET -ContentType "application/json"
    Write-Host "Brands:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:"
    $_.Exception.Message
}
