from flask import Flask, request, jsonify
from flask_cors import CORS
from favorite import FavoriteEventManager

app = Flask(__name__)
CORS(app)
manager = FavoriteEventManager()  # initialize the manager

@app.route("/favorites", methods=["GET"])
def get_favorites():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    favorites = manager.get_favorites(email)
    return jsonify(favorites)

@app.route("/favorites/toggle", methods=["POST"])
def toggle_favorite():
    data = request.json
    email = data.get("email")
    event = data.get("event")

    if not email or not event:
        return jsonify({"error": "Email and event required"}), 400

    result = manager.toggle_favorite(email, event)
    return jsonify({"result": result})


app.run(debug=True, host='0.0.0.0', port=5002)
