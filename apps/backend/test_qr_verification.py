import time
import json
import models, database, auth
from main import generate_mess_qr_token, verify_mess_qr_payload

def test_cryptography():
    print("Testing Cryptographic Mess QR Engine...")
    secret = "my_super_secret_key_123"
    inst_id = 1
    inst_name = "Example Tech University"

    # 1. Generate token
    token = generate_mess_qr_token(inst_id, inst_name, secret, ttl_seconds=180)
    print("Generated token payload:", token["payload_string"][:80], "...")
    assert "sig" in token["payload_string"]

    # 2. Verify valid token
    decoded = verify_mess_qr_payload(token["payload_string"], inst_id, secret)
    assert decoded["institution_id"] == 1
    print("[OK] Valid token verified successfully.")

    # 3. Test tampered signature
    tampered = json.loads(token["payload_string"])
    tampered["sig"] = "fake_tampered_signature_12345"
    try:
        verify_mess_qr_payload(json.dumps(tampered), inst_id, secret)
        assert False, "Should have failed on tampered signature"
    except ValueError as e:
        print("[OK] Tampered signature correctly rejected:", e)

    # 4. Test wrong mess/institution
    try:
        verify_mess_qr_payload(token["payload_string"], expected_institution_id=99, secret_key=secret)
        assert False, "Should have failed on wrong mess"
    except ValueError as e:
        print("[OK] Wrong mess correctly rejected:", e)

    # 5. Test expired token
    expired_token = generate_mess_qr_token(inst_id, inst_name, secret, ttl_seconds=-60)
    try:
        verify_mess_qr_payload(expired_token["payload_string"], inst_id, secret)
        assert False, "Should have failed on expired token"
    except ValueError as e:
        print("[OK] Expired token correctly rejected:", e)

    print("\nALL CRYPTOGRAPHIC TESTS PASSED!")

if __name__ == "__main__":
    test_cryptography()
