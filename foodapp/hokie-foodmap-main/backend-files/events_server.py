from flask import Flask, send_file

app = Flask(__name__)

@app.route('/events')
def get_events():
    return send_file('events.json')

app.run(host='0.0.0.0', port=5001)
