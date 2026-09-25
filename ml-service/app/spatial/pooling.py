"""
VarshaSetu - Spatial Pooling and Hierarchical Aggregation
Provides spatial aggregation algorithms across District, Block, and Panchayat administrative units.
"""

from typing import Dict, List, Optional
import numpy as np
from pydantic import BaseModel


class BlockObservation(BaseModel):
    block_id: str
    rainfall_val: float
    weight: float = 1.0


def aggregate_district_mean(observations: List[BlockObservation]) -> Dict[str, float]:
    """
    Computes weighted average and dispersion across constituent blocks of a district.
    """
    if not observations:
        return {"mean": 0.0, "min": 0.0, "max": 0.0, "std": 0.0, "total_blocks": 0}

    vals = np.array([o.rainfall_val for o in observations], dtype=float)
    weights = np.array([o.weight for o in observations], dtype=float)
    tot_weight = weights.sum()

    if tot_weight <= 0:
        weights = np.ones_like(vals)
        tot_weight = weights.sum()

    weighted_mean = float(np.sum(vals * weights) / tot_weight)
    return {
        "mean": round(weighted_mean, 2),
        "min": round(float(np.min(vals)), 2),
        "max": round(float(np.max(vals)), 2),
        "std": round(float(np.std(vals)), 2),
        "total_blocks": len(observations)
    }
