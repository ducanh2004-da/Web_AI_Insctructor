import requests


course_id = "1"
lesson_id = "1"
question = "cau truc du lieu la gi?"
url = "http://localhost:8000/ask"

try:
    response = requests.post(
        url, json={"question": question, "course_id": course_id, "lesson_id": lesson_id}
    )
    response.raise_for_status()
    result = response.json()
    print(result["result"])
except requests.exceptions.RequestException as e:
    print(f"error: {e}")
