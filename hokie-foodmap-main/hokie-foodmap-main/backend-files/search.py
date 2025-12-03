# search.py
from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Load events once at startup
with open('events.json', encoding='utf-8') as f:
    EVENTS = json.load(f)

@app.route('/search')
def search_events():
    query = request.args.get('q', '').lower().strip()
    
    if not query:
        return jsonify(EVENTS)  # Return all if empty query

    results = []
    for event in EVENTS:
        # Search across title, description, and hosted_by
        if (
            query in event.get("title", "").lower() or
            query in event.get("description", "").lower() or
            query in event.get("hosted_by", "").lower()
        ):
            results.append(event)

    return jsonify(results)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5003, debug=True)


