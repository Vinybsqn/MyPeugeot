#!/usr/bin/env python3
"""
Token keep-alive script for psa-car-controller.

Refreshes the OAuth token every run to prevent expiration.
Designed to be called via cron every 12 hours on the VPS.

Setup on VPS:
  scp refresh_token.py root@116.203.200.254:/opt/e208/
  ssh root@116.203.200.254
  (crontab -l 2>/dev/null; echo "0 */12 * * * /opt/e208/venv/bin/python /opt/e208/refresh_token.py >> /opt/e208/refresh_token.log 2>&1") | crontab -
"""

import json
import sys
import os
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(SCRIPT_DIR)
CONFIG_FILE = "config.json"


def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def refresh():
    with open(CONFIG_FILE, "r") as f:
        config = json.load(f)
    old_token = config.get("refresh_token", "")
    log(f"Current token: {old_token[:8]}...{old_token[-4:]}")

    from oauth2_client.credentials_manager import ServiceInformation
    from psa_car_controller.psa.oauth import OpenIdCredentialManager
    from psa_car_controller.psa.constants import realm_info, AUTHORIZE_SERVICE

    realm = config["realm"]
    si = ServiceInformation(
        AUTHORIZE_SERVICE[realm],
        realm_info[realm]["oauth_url"],
        config["client_id"],
        config["client_secret"],
        ["openid profile"],
        True,
    )
    mgr = OpenIdCredentialManager.create(
        si, realm_info[realm]["scheme"], config["country_code"]
    )
    mgr.refresh_token = config["refresh_token"]

    try:
        mgr._refresh_token()
    except Exception as e:
        log(f"ERROR: {e}")
        return False

    if mgr.refresh_token and mgr.refresh_token != old_token:
        config["refresh_token"] = mgr.refresh_token
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4, sort_keys=True)
    log("OK: Token refreshed")
    return True


if __name__ == "__main__":
    sys.exit(0 if refresh() else 1)
