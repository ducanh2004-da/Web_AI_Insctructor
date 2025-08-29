import requests

course_id = "1"
emotion = "vui ve"
lesson_id = "1"
url = "http://localhost:8000/rewrite-pdf-emotion"

try:
    response = requests.post(
        url, json={"emotion": emotion, "course_id": course_id, "lesson_id": lesson_id}
    )
    response.raise_for_status()
    result = response.json()
    print(result["rewritten_text"])
except requests.exceptions.RequestException as e:
    print(f"error: {e}")
