import io
from PIL import Image

def test_unauthorized_media_upload_rejected(client):
    fake_file = io.BytesIO(b"fake image bytes")
    files = {"file": ("test.jpg", fake_file, "image/jpeg")}
    res = client.post("/api/v1/media/upload", files=files)
    assert res.status_code == 401

def test_upload_invalid_extension_rejected(client, curator_headers):
    fake_exe = io.BytesIO(b"binary executable data")
    files = {"file": ("malicious.exe", fake_exe, "application/octet-stream")}
    res = client.post("/api/v1/media/upload", headers=curator_headers, files=files)
    assert res.status_code == 400
    assert "invalid file type" in res.json()["detail"].lower()

def test_upload_corrupted_image_rejected_by_pillow(client, curator_headers):
    # Spoofed content type claiming to be JPEG, but containing invalid bytes
    corrupted_bytes = io.BytesIO(b"NOT A REAL JPEG FILE CONTENT")
    files = {"file": ("corrupt.jpg", corrupted_bytes, "image/jpeg")}
    res = client.post("/api/v1/media/upload", headers=curator_headers, files=files)
    assert res.status_code == 400
    assert "could not be verified as a valid" in res.json()["detail"].lower()

def test_upload_valid_image_succeeds(client, curator_headers):
    # Generate a real, valid 10x10 RGB JPEG image in memory
    img = Image.new("RGB", (10, 10), color=(217, 119, 6))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    files = {"file": ("authentic_warli.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    data = {"folder": "art-forms"}
    res = client.post("/api/v1/media/upload", headers=curator_headers, files=files, data=data)
    assert res.status_code == 200
    resp_data = res.json()
    assert "filename" in resp_data
    assert "url" in resp_data
    assert resp_data["size_bytes"] == len(img_bytes)
    assert resp_data["url"].startswith("/media/")
