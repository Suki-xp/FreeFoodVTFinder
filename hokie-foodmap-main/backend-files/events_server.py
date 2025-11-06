from flask import Flask, json, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/events')
def get_events():
    with open('events.json', encoding='utf-8') as f:
        events = json.load(f)
    return jsonify(events)

app.run(host='0.0.0.0', port=5001)
