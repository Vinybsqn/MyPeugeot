#!/bin/bash
# Lancer ce script sur le VPS : bash setup_sse.sh

set -e

echo "=== Installation flask-cors ==="
/opt/e208/venv/bin/pip install flask-cors

echo "=== Copie du bridge ==="
cp /root/sse_bridge.py /opt/e208/sse_bridge.py

echo "=== Création du service systemd ==="
cat > /etc/systemd/system/sse-bridge.service << 'EOF'
[Unit]
Description=SSE Bridge — e208 real-time
After=network.target e208.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/e208
ExecStart=/opt/e208/venv/bin/python3 /opt/e208/sse_bridge.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo "=== Mise à jour cloudflared ==="
cat > /etc/cloudflared/config.yml << 'EOF'
tunnel: 20d4934b-cd17-4165-a8b6-f64b570984df
credentials-file: /root/.cloudflared/20d4934b-cd17-4165-a8b6-f64b570984df.json
ingress:
  - hostname: api.vbasquin.com
    path: /events
    service: http://localhost:5002
  - hostname: api.vbasquin.com
    service: http://localhost:5000
  - service: http_status:404
EOF

echo "=== Démarrage des services ==="
systemctl daemon-reload
systemctl enable sse-bridge --now
systemctl restart cloudflared

echo "=== Test ==="
sleep 3
curl -s http://127.0.0.1:5002/health
echo ""
echo "=== OK ==="
