import socket

def find_open_ports():
    ports = [8000, 8080, 5000, 3000, 5173]
    for port in ports:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            result = s.connect_ex(('127.0.0.1', port))
            if result == 0:
                print(f"Port {port} is OPEN")
            else:
                print(f"Port {port} is CLOSED")

if __name__ == "__main__":
    find_open_ports()
