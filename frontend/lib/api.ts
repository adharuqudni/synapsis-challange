const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'


export async function savePolygon(points: number[][]) {
  const response = await fetch(`${API_BASE_URL}/api/config/area`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coordinates: points }),
  })
  return response.json()
}