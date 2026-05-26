from pathlib import Path

from fastapi.testclient import TestClient

from main import app, get_processed_clusters
from train import run_model_training


def test_clusters_endpoint_returns_frontend_shape():
    client = TestClient(app)

    response = client.get("/api/analytics/clusters")

    assert response.status_code == 200
    payload = response.json()
    assert 1 <= len(payload) <= 100
    assert set(payload[0]) == {"hour", "kw", "temperature", "cluster"}
    assert isinstance(payload[0]["hour"], int)
    assert isinstance(payload[0]["kw"], float)
    assert isinstance(payload[0]["temperature"], float)
    assert isinstance(payload[0]["cluster"], int)


def test_get_processed_clusters_can_use_explicit_paths(tmp_path):
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
    run_model_training(csv_path=csv_path, model_dir=model_dir)

    payload = get_processed_clusters(csv_path=csv_path, model_dir=model_dir)

    assert len(payload) == 6
    assert payload[0]["hour"] in range(24)
    assert payload[0]["cluster"] in {0, 1, 2}
