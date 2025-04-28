import time
import requests
import random  # Replace this with actual sensor readings

def get_sensor_data():
    return {
        "pulse": random.randint(500, 600),
        "temperature": round(36 + random.random(), 2)
    }

while True:
    data = get_sensor_data()
    try:
        requests.post("http://localhost:3000/api/sensors", json=data)
        print("Sent:", data)
    except Exception as e:
        print("Error sending data:", e)
    time.sleep(5)