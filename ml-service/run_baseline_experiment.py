import json
from app.training.pipeline import BaselineTrainingPipeline

def main():
    print("=" * 70)
    print("VARSHASETU — PHASE 4A BASELINE EXPERIMENT RUNNER")
    print("=" * 70)

    # 1. Binary Heavy Rain Baseline
    print("\n▶ [1/3] Running Binary Baseline: HEAVY_RAIN (7-Day Horizon)...")
    res_heavy = BaselineTrainingPipeline.run_binary_baseline(
        target_name="HEAVY_RAIN",
        horizon_days=7
    )
    print(f"  ✓ Experiment ID: {res_heavy['experiment_id']}")
    print(f"  ✓ Quality Status: {res_heavy['quality_audit']['quality_status']}")
    print(f"  ✓ Climatological Base Probability: {res_heavy['climatology_baseline']['baseline_probability']}")
    print(f"  ✓ Test Brier Score: {res_heavy['test_metrics']['brier_score']}")
    print(f"  ✓ Comparison: {res_heavy['comparison']['scientific_summary']}")
    print(f"  ✓ Calibration: {res_heavy['calibration_status']}")

    # 2. Binary Dry Spell Baseline
    print("\n▶ [2/3] Running Binary Baseline: DRY_SPELL (7-Day Horizon)...")
    res_dry = BaselineTrainingPipeline.run_binary_baseline(
        target_name="DRY_SPELL",
        horizon_days=7
    )
    print(f"  ✓ Experiment ID: {res_dry['experiment_id']}")
    print(f"  ✓ Test Brier Score: {res_dry['test_metrics']['brier_score']}")
    print(f"  ✓ Comparison: {res_dry['comparison']['scientific_summary']}")

    # 3. Continuous Rainfall Amount Baseline
    print("\n▶ [3/3] Running Continuous Baseline: RAINFALL_SUM (7-Day Horizon)...")
    res_rain = BaselineTrainingPipeline.run_continuous_baseline(
        target_name="rainfall_amount",
        horizon_days=7
    )
    print(f"  ✓ Experiment ID: {res_rain['experiment_id']}")
    print(f"  ✓ Test MAE: {res_rain['test_metrics']['mae']} mm (Observed Mean: {res_rain['test_metrics']['mean_observed']} mm)")
    print(f"  ✓ Comparison: {res_rain['comparison']['scientific_summary']}")

    print("\n" + "=" * 70)
    print("🎉 All Phase 4A baseline experiments completed successfully!")
    print("=" * 70)

if __name__ == "__main__":
    main()
