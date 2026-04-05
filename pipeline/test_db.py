import os, sys, urllib.parse
from pymongo import MongoClient

# Try unencoded
pw = "N!y@nt123"
user = "niyantsanja"
enc_pw = urllib.parse.quote_plus(pw)

uri = f"mongodb+srv://{user}:{enc_pw}@cluster0.ydblurb.mongodb.net/?appName=Cluster0"

print("Trying encoded URI:", uri)
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
try:
    info = client.server_info()
    print("SUCCESS!! Auth OK!")
except Exception as e:
    print("FAILED:", e)
