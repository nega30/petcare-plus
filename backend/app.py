
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from pathlib import Path

app = Flask(__name__)
CORS(app)

MODEL_PATH = Path(__file__).parent / "pet_care_model.joblib"
model = joblib.load(MODEL_PATH)

@app.route("/")
def home():
    return jsonify({
        "message": "PetCare+ AI Recommendation API is running!"
    })

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.get_json(silent=True) or {}

    required = [
        "species",
        "age_group",
        "activity_level",
        "weight_status"
    ]

    if any(not data.get(key) for key in required):
        return jsonify({
            "error": "Please provide all four pet details."
        }), 400

    pet = pd.DataFrame([{
        key: data[key].strip().lower()
        for key in required
    }])

    try:
        recommendation = model.predict(pet)[0]
        return jsonify({
            "recommendation": str(recommendation),
            "notice": (
                "Educational demo only. "
                "Consult a veterinarian for health concerns."
            )
        })
    except Exception as error:
        return jsonify({
            "error": "Could not generate a recommendation.",
            "details": str(error)
        }), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
