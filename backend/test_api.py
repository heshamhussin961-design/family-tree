import urllib.request
import urllib.error
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
try:
    res = urllib.request.urlopen("http://127.0.0.1:8080/stats", context=ctx)
    print(res.read())
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode())
