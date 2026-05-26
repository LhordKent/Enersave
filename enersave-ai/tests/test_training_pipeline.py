from pathlib import Path

import pandas as pd

from train import FEATURE_COLUMNS, build_feature_matrix, run_model_training


def test_build_feature_matrix_accepts_current_dataset_headers():
    df = pd.DataFrame(
        {
            "Timestamp": ["2024-01-01 03:30:00", "2024-01-01 14:00:00"],
            "Electricity_Consumed": [0.42, 0.87],
            "Temperature": [0.31, 0.65],
        }
    )

    matrix = build_feature_matrix(df)

    assert list(matrix.columns) == FEATURE_COLUMNS
    assert matrix.to_dict("records") == [
        {"Hour_Of_Day": 3, "Electricity_Consumed": 0.42, "Temperature": 0.31},
        {"Hour_Of_Day": 14, "Electricity_Consumed": 0.87, "Temperature": 0.65},
    ]


def test_run_model_training_serializes_model_and_scaler(tmp_path):
    data_dir = tmp_path / "data"
    model_dir = tmp_path / "models"
    data_dir.mkdir()
    csv_path = data_dir / "smart_meter_data.csv"
    csv_path.write_text(
        "Timestamp,Electricity_Consumed,Temperature\n"
        "2024-01-01 00:00:00,0.20,0.30\n"
        "2024-01-01 01:00:00,0.25,0.35\n"
        "2024-01-01 10:00:00,0.70,0.60\n"
        "2024-01-01 11:00:00,0.75,0.65\n"
        "2024-01-01 20:00:00,0.45,0.50\n"
        "2024-01-01 21:00:00,0.50,0.55\n",
        encoding="utf-8",
    )

    artifacts = run_model_training(csv_path=csv_path, model_dir=model_dir)

    assert artifacts["model_path"] == model_dir / "kmeans_model.pkl"
    assert artifacts["scaler_path"] == model_dir / "scaler.pkl"
    assert artifacts["model_path"].exists()
    assert artifacts["scaler_path"].exists()
