
from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "pet_care_data.csv"
MODEL_PATH = BASE_DIR / "pet_care_model.joblib"

def main():
    data = pd.read_csv(DATA_PATH)

    features = [
        "species",
        "age_group",
        "activity_level",
        "weight_status",
    ]
    target = "recommendation"

    X = data[features]
    y = data[target]

    preprocessor = ColumnTransformer([
        ("categorical", OneHotEncoder(handle_unknown="ignore"), features)
    ])

    model = make_pipeline(
        preprocessor,
        DecisionTreeClassifier(random_state=42)
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    # Retrain on the complete sample dataset for use by the app
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)

    print(f"Training examples: {len(data)}")
    print(f"Test accuracy: {accuracy:.2%}")
    print(f"Saved model: {MODEL_PATH}")
    print("Note: This is a tiny illustrative dataset, not validated pet-care advice.")

if __name__ == "__main__":
    main()
