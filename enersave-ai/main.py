from pathlib import Path
import pickle

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from train import DEFAULT_CSV_PATH, DEFAULT_MODEL_DIR, build_feature_matrix, run_model_training


app = FastAPI(title="Enersave AI Infrastructure Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_pipeline(model_dir: Path | str = DEFAULT_MODEL_DIR):
    model_dir = Path(model_dir)
    model_path = model_dir / "kmeans_model.pkl"
    scaler_path = model_dir / "scaler.pkl"

    if not model_path.exists() or not scaler_path.exists():
        run_model_training(model_dir=model_dir)

    with model_path.open("rb") as model_file:
        model = pickle.load(model_file)
    with scaler_path.open("rb") as scaler_file:
        scaler = pickle.load(scaler_file)
    return model, scaler


def get_processed_clusters(
    csv_path: Path | str = DEFAULT_CSV_PATH,
    model_dir: Path | str = DEFAULT_MODEL_DIR,
) -> list[dict[str, int | float]]:
    model, scaler = load_pipeline(model_dir)
    df = pd.read_csv(csv_path)
    features = build_feature_matrix(df)

    x_scaled = scaler.transform(features)
    result = features.copy()
    result["cluster"] = model.predict(x_scaled)
    result_sample = result.sample(n=min(100, len(result)), random_state=42).copy()

    payload: list[dict[str, int | float]] = []
    for _, row in result_sample.iterrows():
        payload.append(
            {
                "hour": int(row["Hour_Of_Day"]),
                "kw": float(row["Electricity_Consumed"]),
                "temperature": float(row["Temperature"]),
                "cluster": int(row["cluster"]),
            }
        )
    return payload


@app.get("/api/analytics/clusters")
def clusters_endpoint():
    return get_processed_clusters()
