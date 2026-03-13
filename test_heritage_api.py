import requests

def test_api():
    try:
        # Assuming the backend is running on localhost:8000 based on common setups
        # If not, I'll try to find the actual port.
        url = "http://localhost:8000/heritage"
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Data received: {len(data)} items")
            for item in data:
                print(f" - {item['section_key']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_api()
