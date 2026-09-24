from etl.bronze.extract_bronze import BronzeExtractor


def test_extract_all_generates_csv_when_missing(monkeypatch):
    called = {"value": 0}

    def fake_exists(_path):
        return False

    def fake_generate_data():
        called["value"] += 1

    monkeypatch.setattr("etl.bronze.extract_bronze.os.path.exists", fake_exists)
    monkeypatch.setattr("etl.generate_data.main", fake_generate_data)
    monkeypatch.setattr(BronzeExtractor, "_read_csv", staticmethod(lambda _filename: []))

    BronzeExtractor().extract_all()

    assert called["value"] == 1


def test_extract_all_skips_generation_when_csv_present(monkeypatch):
    called = {"value": 0}

    def fake_generate_data():
        called["value"] += 1

    monkeypatch.setattr("etl.bronze.extract_bronze.os.path.exists", lambda _path: True)
    monkeypatch.setattr("etl.generate_data.main", fake_generate_data)
    monkeypatch.setattr(BronzeExtractor, "_read_csv", staticmethod(lambda _filename: []))

    BronzeExtractor().extract_all()

    assert called["value"] == 0
