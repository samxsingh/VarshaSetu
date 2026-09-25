"""
VarshaSetu - Provider-Neutral Delivery Abstraction (Phase 4F)
Defines provider interfaces and internal simulation implementations.
External telecommunications and messaging APIs are strictly forbidden here.
"""

from abc import ABC, abstractmethod
import logging
import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from ..schemas.delivery import (
    DeliveryChannel,
    DeliveryStatus,
    DeliveryMessage,
    DeliveryResult,
)

logger = logging.getLogger("varshasetu.delivery")


class DeliveryProvider(ABC):
    """Abstract interface for all notification delivery providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name."""
        pass

    @abstractmethod
    def send(self, message: DeliveryMessage) -> DeliveryResult:
        """Dispatches a delivery message."""
        pass


class ConsoleDeliveryProvider(DeliveryProvider):
    """
    Simulates notification delivery by printing to system logs.
    """

    @property
    def name(self) -> str:
        return "ConsoleDeliveryProvider"

    def send(self, message: DeliveryMessage) -> DeliveryResult:
        if message.channel in (DeliveryChannel.SMS, DeliveryChannel.WHATSAPP, DeliveryChannel.VOICE):
            return DeliveryResult(
                message_id=message.message_id,
                channel=message.channel,
                status=DeliveryStatus.NOT_CONFIGURED,
                provider_name=self.name,
                details={
                    "note": f"External telecommunications provider for '{message.channel.value}' is not configured in Phase 4F."
                },
            )

        logger.info(
            f"[DELIVERY SIMULATION] Channel={message.channel.value} "
            f"Recipient={message.recipient_id} Title='{message.title}' Body='{message.body}'"
        )

        return DeliveryResult(
            message_id=message.message_id,
            channel=message.channel,
            status=DeliveryStatus.SIMULATED,
            provider_name=self.name,
            details={"dispatched_via": "system_logger"},
        )


class DatabaseDeliveryProvider(DeliveryProvider):
    """
    Simulates notification delivery by writing immutable dispatch logs to disk.
    """

    DEFAULT_LOG_DIR = Path(__file__).parent.parent.parent / "artifacts" / "deliveries"

    def __init__(self, log_dir: Optional[Path] = None):
        self.log_dir = log_dir or self.DEFAULT_LOG_DIR
        self.log_dir.mkdir(parents=True, exist_ok=True)

    @property
    def name(self) -> str:
        return "DatabaseDeliveryProvider"

    def send(self, message: DeliveryMessage) -> DeliveryResult:
        if message.channel in (DeliveryChannel.SMS, DeliveryChannel.WHATSAPP, DeliveryChannel.VOICE):
            return DeliveryResult(
                message_id=message.message_id,
                channel=message.channel,
                status=DeliveryStatus.NOT_CONFIGURED,
                provider_name=self.name,
                details={"note": "External carrier gateway not configured. Delivery safely aborted."},
            )

        # Record simulation artifact
        log_file = self.log_dir / f"delivery_{message.message_id}.json"
        res = DeliveryResult(
            message_id=message.message_id,
            channel=message.channel,
            status=DeliveryStatus.DELIVERED if message.channel == DeliveryChannel.IN_APP else DeliveryStatus.SIMULATED,
            provider_name=self.name,
            details={"storage_path": str(log_file)},
        )

        payload = {
            "message": message.model_dump(mode="json"),
            "result": res.model_dump(mode="json"),
        }
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        return res


class NoOpDeliveryProvider(DeliveryProvider):
    """
    No-op provider that safely swallows notifications for test runs and silent audits.
    """

    @property
    def name(self) -> str:
        return "NoOpDeliveryProvider"

    def send(self, message: DeliveryMessage) -> DeliveryResult:
        return DeliveryResult(
            message_id=message.message_id,
            channel=message.channel,
            status=DeliveryStatus.SIMULATED,
            provider_name=self.name,
            details={"action": "noop_swallowed"},
        )
