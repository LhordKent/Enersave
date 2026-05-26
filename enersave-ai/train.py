from pathlib import Path
import pickle

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_CSV_PATH = BASE_DIR / "data" / "smart_meter_data.csv"
DEFAULT_MODEL_DIR = BASE_DIR / "models"
FEATURE_COLUMNS = ["Hour_Of_Day", "Electricity_Consumed", "Temperature"]


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    required_columns = {"Timestamp", "Electricity_Consumed", "Temperature"}
    missing_columns = required_columns.difference(df.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise ValueError(f"Missing required dataset columns: {missing}")

    feature_df = df.copy()
    feature_df["Timestamp"] = pd.to_datetime(feature_df["Timestamp"])
    feature_df["Hour_Of_Day"] = feature_df["Timestamp"].dt.hour
    return feature_df[FEATURE_COLUMNS].dropna()


def run_model_training(
    csv_path: Path | str = DEFAULT_CSV_PATH,
    model_dir: Path | str = DEFAULT_MODEL_DIR,
) -> dict[str, Path]:
    csv_path = Path(csv_path)
    model_dir = Path(model_dir)
    if not csv_path.exists():
        raise FileNotFoundError(f"Missing base historical dataset at {csv_path}")

    df = pd.read_csv(csv_path)
    features = build_feature_matrix(df)

    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(features)

    model = KMeans(n_clusters=3, init="k-means++", max_iter=300, random_state=42)
    model.fit(x_scaled)

    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "kmeans_model.pkl"
    scaler_path = model_dir / "scaler.pkl"

    with model_path.open("wb") as model_file:
        pickle.dump(model, model_file)
    with scaler_path.open("wb") as scaler_file:
        pickle.dump(scaler, scaler_file)

    print("Enersave ML training cycle successfully completed. Models serialized.")
    return {"model_path": model_path, "scaler_path": scaler_path}


if __name__ == "__main__":
    run_model_training()
