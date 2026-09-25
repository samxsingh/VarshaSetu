import json
from app.inspection.inspector import DataInspector

def main():
    print("=" * 70)
    print("VARSHASETU — SCIENTIFIC DATA INSPECTOR (PHASE 3 DATASETS)")
    print("=" * 70)
    reports = DataInspector.inspect_all()
    for name, r in reports.items():
        print(f"\n📂 DATASET: {name}")
        print(f"  ├── File: {r.file_path}")
        print(f"  ├── Rows: {r.rows:,} | Columns: {r.columns}")
        print(f"  ├── Temporal Range: {r.date_min} to {r.date_max} ({r.temporal_frequency or 'N/A'})")
        print(f"  ├── Duplicates: {r.duplicate_count} | Overall Missing: {r.missing_percentage}%")
        print(f"  ├── Geographies ({r.geography_count}): {', '.join(r.geographies[:5])}")
        print(f"  ├── Quality Flags: {r.quality_summary}")
        print(f"  └── Sample Columns: {', '.join(r.column_names[:8])}...")

if __name__ == "__main__":
    main()
