"""
VarshaSetu - Delivery Router (Phase 4F)
Directs messages to appropriate delivery providers based on channel selection.
"""

from typing import Dict
from ..schemas.delivery import (
    DeliveryChannel,
    DeliveryMessage,
    DeliveryResult,
)
from .provider import (
    DeliveryProvider,
    ConsoleDeliveryProvider,
    DatabaseDeliveryProvider,
    NoOpDeliveryProvider,
)


class DeliveryRouter:
    """
    Central dispatcher routing notification messages to active delivery providers.
    """

    _providers: Dict[DeliveryChannel, DeliveryProvider] = {
        DeliveryChannel.IN_APP: DatabaseDeliveryProvider(),
        DeliveryChannel.LOG: ConsoleDeliveryProvider(),
        DeliveryChannel.EMAIL: ConsoleDeliveryProvider(),
        DeliveryChannel.SMS: ConsoleDeliveryProvider(),
        DeliveryChannel.WHATSAPP: ConsoleDeliveryProvider(),
        DeliveryChannel.VOICE: ConsoleDeliveryProvider(),
    }

    @classmethod
    def register_provider(cls, channel: DeliveryChannel, provider: DeliveryProvider) -> None:
        cls._providers[channel] = provider

    @classmethod
    def dispatch(cls, message: DeliveryMessage) -> DeliveryResult:
        provider = cls._providers.get(message.channel, NoOpDeliveryProvider())
        return provider.send(message)
