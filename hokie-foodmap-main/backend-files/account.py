from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

ACCOUNTS_FILE = "account.json"

# Helper function to read accounts
def read_accounts():
    if not os.path.exists(ACCOUNTS_FILE):
        return []
    with open(ACCOUNTS_FILE, "r") as f:
        accounts = [json.loads(line) for line in f.readlines()]
    return accounts

# Helper function to write accounts
def write_account(email):
    accounts = read_accounts()
    # Prevent duplicates
    if any(acc.get("email") == email for acc in accounts):
        return False
    new_acc = {"email": email}
    accounts.append(new_acc)
    with open(ACCOUNTS_FILE, "w") as f:
        for acc in accounts:
            f.write(json.dumps(acc) + "\n")
    return True

# Route to register a new account
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get("email", "").strip()
    if not email.endswith("@vt.edu") or "@" not in email or "." not in email:
        return jsonify({"status": "error", "message": "Invalid VT email"}), 400
    success = write_account(email)
    if not success:
        return jsonify({"status": "error", "message": "Email already exists"}), 400
    return jsonify({"status": "success", "email": email})

# Route to login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email", "").strip()
    accounts = read_accounts()
    if any(acc.get("email") == email for acc in accounts):
        return jsonify({"status": "success", "email": email})
    return jsonify({"status": "error", "message": "Email not found"}), 404

# Route to list all accounts (for testing)
@app.route('/accounts', methods=['GET'])
def accounts():
    return jsonify(read_accounts())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
@app.route('/favorite', methods=['POST'])
def favorite_event():
    data = request.json
    email = data.get("email")
    event = data.get("event")  # event is a dict with date, location, hosted_by
    accounts = read_accounts()
    
    # Find user
    user = next((acc for acc in accounts if acc["email"] == email), None)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    # Avoid duplicates
    if event not in user.get("favorites", []):
        user.setdefault("favorites", []).append(event)
        with open(ACCOUNTS_FILE, "w") as f:
            json.dump(accounts, f, indent=2)

    return jsonify({"status": "success", "favorites": user["favorites"]})

@app.route('/favorites/<email>', methods=['GET'])
def get_favorites(email):
    accounts = read_accounts()
    user = next((acc for acc in accounts if acc["email"] == email), None)
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
    return jsonify(user.get("favorites", []))