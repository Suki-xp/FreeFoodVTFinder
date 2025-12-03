from flask import Flask, json, jsonify, send_file, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/events')
def get_events():
    with open('events.json', encoding='utf-8') as f:
        events = json.load(f)
    return jsonify(events)

@app.route('/static_maps/<path:filename>')
def static_map(filename):
    return send_from_directory('static_maps', filename)

app.run(host='0.0.0.0', port=5001)
