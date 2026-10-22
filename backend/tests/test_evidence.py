import io

import cv2
from PIL import Image


def _png_bytes() -> bytes:
    output = io.BytesIO()
    Image.new("RGB", (120, 80), "white").save(output, format="PNG")
    return output.getvalue()


def _qr_png_bytes(content: str) -> bytes:
    qr = cv2.QRCodeEncoder_create().encode(content)
    qr = cv2.resize(qr, None, fx=10, fy=10, interpolation=cv2.INTER_NEAREST)
    success, encoded = cv2.imencode(".png", qr)
    assert success
    return encoded.tobytes()


def _offer_id(client) -> str:
    response = client.post(
        "/api/v1/offers",
        json={
            "company_name": "Example Labs",
            "job_title": "Security Intern",
            "message": "Please review this complete offer message before accepting.",
            "sender_email": "recruiter@example.com",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_valid_image_is_processed_and_persisted(client, monkeypatch) -> None:
    monkeypatch.setattr("app.api.routes.evidence.extract_text", lambda image: ("Pay a fee to start this job.", True))
    monkeypatch.setattr(
        "app.api.routes.evidence.detect_qr",
        lambda image: [{"content": "https://example.test/apply", "kind": "url", "warning": "Do not open this destination."}],
    )
    response = client.post(
        f"/api/v1/offers/{_offer_id(client)}/attachments",
        files={"file": ("offer.png", _png_bytes(), "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["ocr"]["text"] == "Pay a fee to start this job."
    assert response.json()["qr_codes"][0]["kind"] == "url"
    assert response.json()["assessment"]["category"] == "High Risk"


def test_image_content_and_size_are_validated(client) -> None:
    offer_id = _offer_id(client)
    unsupported = client.post(
        f"/api/v1/offers/{offer_id}/attachments",
        files={"file": ("offer.png", b"not an image", "image/png")},
    )
    assert unsupported.status_code == 415

    oversized = client.post(
        f"/api/v1/offers/{offer_id}/attachments",
        files={"file": ("offer.jpg", b"x" * (5 * 1024 * 1024 + 1), "image/jpeg")},
    )
    assert oversized.status_code == 413


def test_unreadable_image_does_not_invent_text(client, monkeypatch) -> None:
    monkeypatch.setattr("app.api.routes.evidence.extract_text", lambda image: ("", False))
    response = client.post(
        f"/api/v1/offers/{_offer_id(client)}/attachments",
        files={"file": ("offer.png", _png_bytes(), "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["ocr"] == {"status": "unreadable", "text": ""}


def test_screenshot_without_qr_reports_no_qr(client, monkeypatch) -> None:
    monkeypatch.setattr("app.api.routes.evidence.extract_text", lambda image: ("Offer text", True))
    response = client.post(
        f"/api/v1/offers/{_offer_id(client)}/attachments",
        files={"file": ("offer.png", _png_bytes(), "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["qr_codes"] == []


def test_screenshot_qr_url_is_decoded_without_fetching(client, monkeypatch) -> None:
    monkeypatch.setattr("app.api.routes.evidence.extract_text", lambda image: ("Offer text", True))
    response = client.post(
        f"/api/v1/offers/{_offer_id(client)}/attachments",
        files={"file": ("offer.png", _qr_png_bytes("https://example.test/apply"), "image/png")},
    )

    assert response.status_code == 200
    qr_codes = response.json()["qr_codes"]
    assert any(item["content"] == "https://example.test/apply" and item["kind"] == "url" for item in qr_codes)
    assert "never fetches" in qr_codes[0]["warning"]


def test_email_authentication_states_and_sender_mismatch(client) -> None:
    content = (
        "From: recruiter@imposter.com\r\n"
        "Reply-To: alternate@imposter.com\r\n"
        "Subject: Urgent offer\r\n"
        "Authentication-Results: mx; spf=pass dkim=fail dmarc=none\r\n"
        "\r\n"
        "Please pay a fee today to start your job.\r\n"
    ).encode()
    response = client.post(
        "/api/v1/email-checks",
        data={"company_name": "Example Labs", "company_website": "https://example.com"},
        files={"file": ("message.eml", content, "message/rfc822")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["authentication"]["spf"]["status"] == "passing"
    assert body["authentication"]["dkim"]["status"] == "failing"
    assert body["authentication"]["dmarc"]["status"] == "inconclusive"
    assert "COMPANY_EMAIL_DOMAIN_MISMATCH" in {item["rule_id"] for item in body["assessment"]["findings"]}


def test_email_missing_authentication_is_not_reported_as_failure(client) -> None:
    response = client.post(
        "/api/v1/email-checks",
        files={"file": ("message.eml", b"From: recruiter@example.com\r\nSubject: Hello\r\n\r\nHi", "message/rfc822")},
    )
    assert response.status_code == 200
    assert response.json()["authentication"]["spf"]["status"] == "missing"


def test_malformed_email_is_rejected(client) -> None:
    response = client.post(
        "/api/v1/email-checks",
        files={"file": ("message.eml", b"\x00\x01\x02", "message/rfc822")},
    )
    assert response.status_code == 422


def test_non_eml_email_upload_is_rejected(client) -> None:
    response = client.post(
        "/api/v1/email-checks",
        files={"file": ("message.txt", b"From: recruiter@example.com\r\n\r\nHello", "text/plain")},
    )

    assert response.status_code == 415
