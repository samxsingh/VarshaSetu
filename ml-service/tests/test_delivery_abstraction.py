"""
VarshaSetu - Delivery Abstraction Tests (Phase 4F)
Verifies provider-neutral routing and rejection of external carrier APIs.
"""

from app.schemas.delivery import DeliveryChannel, DeliveryStatus, DeliveryMessage
from app.delivery.provider import ConsoleDeliveryProvider, DatabaseDeliveryProvider, NoOpDeliveryProvider
from app.delivery.router import DeliveryRouter


def test_console_delivery_simulation():
    provider = ConsoleDeliveryProvider()
    msg = DeliveryMessage(
        recipient_id="user_farmer_01",
        channel=DeliveryChannel.LOG,
        event_id="ev_test_01",
        title="Diagnostic Alert Notice",
        body="Diagnostic heavy rainfall detected in forecast.",
    )

    res = provider.send(msg)
    assert res.status == DeliveryStatus.SIMULATED
    assert res.provider_name == "ConsoleDeliveryProvider"


def test_external_sms_channel_returns_not_configured():
    provider = ConsoleDeliveryProvider()
    msg = DeliveryMessage(
        recipient_id="+919876543210",
        channel=DeliveryChannel.SMS,
        event_id="ev_test_01",
        title="SMS Alert Notice",
        body="Text message alert.",
    )

    res = provider.send(msg)
    assert res.status == DeliveryStatus.NOT_CONFIGURED
    assert "not configured" in res.details.get("note", "").lower()


def test_database_delivery_provider(tmp_path):
    provider = DatabaseDeliveryProvider(log_dir=tmp_path)
    msg = DeliveryMessage(
        recipient_id="officer_lko_01",
        channel=DeliveryChannel.IN_APP,
        event_id="ev_test_02",
        title="In-App Notification",
        body="Diagnostic review required.",
    )

    res = provider.send(msg)
    assert res.status == DeliveryStatus.DELIVERED
    assert (tmp_path / f"delivery_{msg.message_id}.json").exists()


def test_delivery_router_dispatch():
    msg = DeliveryMessage(
        recipient_id="analyst_01",
        channel=DeliveryChannel.EMAIL,
        event_id="ev_test_03",
        title="Report Dispatched",
        body="Report summary.",
    )

    res = DeliveryRouter.dispatch(msg)
    assert res.status == DeliveryStatus.SIMULATED
