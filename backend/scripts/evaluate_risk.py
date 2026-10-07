import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.risk_check import assess_risk
from app.services.safety_loader import SAFETY_DIR, load_safety_json


def main() -> None:
    samples = _load_samples()
    tp = fn = tn = fp = 0
    missed: list[int] = []
    false_alarms: list[int] = []

    for sample in samples:
        label = str(sample.get("label", ""))
        is_crisis = label == "crisis"
        detected = bool(assess_risk(str(sample.get("text", "")))["riskDetected"])
        sample_id = int(sample["id"])
        if is_crisis and detected:
            tp += 1
        elif is_crisis and not detected:
            fn += 1
            missed.append(sample_id)
        elif not is_crisis and not detected:
            tn += 1
        else:
            fp += 1
            false_alarms.append(sample_id)

    recall_den = tp + fn
    alarm_den = tn + fp
    recall = (tp / recall_den) if recall_den else 0
    false_alarm = (fp / alarm_den) if alarm_den else 0
    print(f"size {len(samples)}")
    print(f"recall {recall * 100:.1f}% ({tp}/{recall_den})")
    print(f"false_alarm {false_alarm * 100:.1f}% ({fp}/{alarm_den})")
    print(f"tp {tp} fn {fn} tn {tn} fp {fp}")
    print(f"missed_ids {missed}")
    print(f"false_alarm_ids {false_alarms}")


def _load_samples() -> list[dict]:
    for path in (SAFETY_DIR / "test-set.json", SAFETY_DIR / "dev-set.json"):
        if path.is_file():
            payload = json.loads(path.read_text(encoding="utf-8"))
            break
    else:
        payload = load_safety_json("test-set.json")
    if not isinstance(payload, list):
        raise ValueError("test set must be a list")
    return [item for item in payload if isinstance(item, dict)]


if __name__ == "__main__":
    main()
