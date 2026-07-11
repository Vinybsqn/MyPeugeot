"""
SSE Bridge — écoute MQTT de psa-car-controller et pousse les mises à jour
en Server-Sent Events vers le dashboard.

Dépendances déjà dans le venv : flask, paho-mqtt, requests
"""
import json
import queue
import threading
import time
import requests
from flask import Flask, Response, stream_with_context
from flask_cors import CORS
import paho.mqtt.client as mqtt

# ─── Config ───────────────────────────────────────────────────────────────────
PSA_API   = "http://127.0.0.1:5000"
VIN       = None   # auto-détecté au démarrage
SSE_PORT  = 5002

# MQTT — mêmes params que psa-car-controller (lus depuis son config)
MQTT_HOST = "mqtt.iothub.stellantis.com"
MQTT_PORT = 8883

# ─── State ────────────────────────────────────────────────────────────────────
clients   = []
clients_lock = threading.Lock()
latest    = {}

app = Flask(__name__)
CORS(app)

# ─── Helpers ──────────────────────────────────────────────────────────────────
def get_vehicle_data():
    try:
        r = requests.get(f"{PSA_API}/get_vehicleinfo/{VIN}", timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception:
        return None

def broadcast(data):
    global latest
    latest = data
    msg = f"data: {json.dumps(data)}\n\n"
    with clients_lock:
        dead = []
        for q in clients:
            try:
                q.put_nowait(msg)
            except Exception:
                dead.append(q)
        for q in dead:
            clients.remove(q)

# ─── Polling fallback (toutes les 5s) ─────────────────────────────────────────
def polling_loop():
    while True:
        data = get_vehicle_data()
        if data:
            broadcast(data)
        time.sleep(5)

# ─── SSE endpoint ─────────────────────────────────────────────────────────────
@app.route("/events")
def events():
    q = queue.Queue()
    with clients_lock:
        clients.append(q)

    # Envoie la dernière data connue immédiatement
    if latest:
        q.put(f"data: {json.dumps(latest)}\n\n")

    def stream():
        try:
            while True:
                try:
                    msg = q.get(timeout=30)
                    yield msg
                except queue.Empty:
                    yield ": ping\n\n"   # keepalive
        finally:
            with clients_lock:
                if q in clients:
                    clients.remove(q)

    return Response(
        stream_with_context(stream()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@app.route("/health")
def health():
    return {"ok": True, "clients": len(clients)}

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Récupère le VIN depuis psa-car-controller
    for _ in range(10):
        try:
            r = requests.get(f"{PSA_API}/get_vehicles", timeout=3)
            vehicles = r.json()
            if vehicles:
                VIN = vehicles[0]["vin"]
                print(f"VIN détecté : {VIN}")
                break
        except Exception:
            time.sleep(2)

    if not VIN:
        print("Impossible de récupérer le VIN, arrêt.")
        exit(1)

    # Lance le polling en arrière-plan
    t = threading.Thread(target=polling_loop, daemon=True)
    t.start()

    print(f"SSE Bridge démarré sur port {SSE_PORT}")
    app.run(host="127.0.0.1", port=SSE_PORT, threaded=True)
