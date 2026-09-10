import pytest

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "VISIGRITY API"
    assert data["blockchain_mode"] == "DEMO"

def test_auth_flow(client):
    # 1. Register new user
    reg_res = client.post("/api/auth/register", json={
        "email": "testuser@visigrity.demo",
        "full_name": "Test Engineer",
        "password": "SecurePassword123!",
        "role": "MODEL DEVELOPER"
    })
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == "testuser@visigrity.demo"
    assert user_data["role"] == "MODEL DEVELOPER"
    assert "password" not in user_data
    assert "password_hash" not in user_data

    # 2. Duplicate registration fails
    dup_res = client.post("/api/auth/register", json={
        "email": "testuser@visigrity.demo",
        "full_name": "Test Engineer",
        "password": "SecurePassword123!",
        "role": "MODEL DEVELOPER"
    })
    assert dup_res.status_code == 400

    # 3. Login with wrong password
    bad_login = client.post("/api/auth/login", json={
        "email": "testuser@visigrity.demo",
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 4. Successful login
    login_res = client.post("/api/auth/login", json={
        "email": "testuser@visigrity.demo",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 5. Get current user
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testuser@visigrity.demo"

def test_datasets_crud_and_verify(client, auth_headers):
    # List datasets
    list_res = client.get("/api/datasets")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Create dataset
    create_res = client.post("/api/datasets", json={
        "name": "Synthetic Drone Surveillance Set",
        "description": "High altitude thermal detection test.",
        "version": "v1.0",
        "contributor_name": "Demo Validator"
    }, headers=auth_headers)
    assert create_res.status_code == 201
    new_dataset = create_res.json()
    assert new_dataset["status"] == "TRUSTED"
    assert len(new_dataset["hash"]) == 64

    # Verify dataset
    verify_res = client.post(f"/api/datasets/{new_dataset['id']}/verify")
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "TRUSTED"

    # Get history
    hist_res = client.get(f"/api/datasets/{new_dataset['id']}/history")
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1

def test_models_crud_and_verify(client, auth_headers):
    list_res = client.get("/api/models")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    create_res = client.post("/api/models", json={
        "name": "VISI-RESNET-TEST",
        "description": "Residual vision backbone test instance.",
        "version": "v1.0",
        "framework": "PyTorch / ResNet",
        "training_dataset_id": "UAV-DEMO-DATA-001",
        "contributor_name": "Alex Chen"
    }, headers=auth_headers)
    assert create_res.status_code == 201
    model_data = create_res.json()
    assert model_data["status"] == "TRUSTED"

    # Verify model
    verify_res = client.post(f"/api/models/{model_data['id']}/verify")
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "TRUSTED"

def test_inferences_and_integrity(client, auth_headers):
    # Run inference
    inf_res = client.post("/api/inferences", json={
        "model_id": "VISI-YOLO-DEMO",
        "is_demo": True
    }, headers=auth_headers)
    assert inf_res.status_code == 201
    inf_data = inf_res.json()
    assert inf_data["status"] == "TRUSTED"
    assert len(inf_data["input_hash"]) == 64
    assert len(inf_data["output_hash"]) == 64
    assert inf_data["result"]["label"] == "Vehicle"

    # Verify pipeline
    int_res = client.post("/api/integrity/verify")
    assert int_res.status_code == 200
    int_data = int_res.json()
    assert int_data["status"] == "TRUSTED"
    assert int_data["stages"]["model"] == "MATCH"

def test_tamper_simulation_lifecycle(client):
    # 1. Simulate model tampering
    sim_res = client.post("/api/security/simulate/model-tampering")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["success"] is True
    assert sim_data["pipeline_status"] == "COMPROMISED"
    assert sim_data["event"]["type"] == "MODEL_HASH_MISMATCH"

    # 2. Verify pipeline integrity reflects COMPROMISED
    verify_res = client.post("/api/integrity/verify")
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["status"] == "COMPROMISED"
    assert verify_data["stages"]["model"] == "MISMATCH"
    assert "MODEL HASH MISMATCH" in verify_data["reason"]

    # 3. Check security events list
    sec_res = client.get("/api/security/events")
    assert sec_res.status_code == 200
    assert len(sec_res.json()) >= 1

    # 4. Reset demo state
    reset_res = client.post("/api/security/reset-demo")
    assert reset_res.status_code == 200

    # 5. Verify pipeline is back to TRUSTED
    post_reset_verify = client.post("/api/integrity/verify")
    assert post_reset_verify.status_code == 200
    assert post_reset_verify.json()["status"] == "TRUSTED"

def test_audit_logs_and_reports(client, auth_headers):
    # Get audit logs
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 3

    # Generate Report
    rpt_res = client.post("/api/reports", json={
        "asset_id": "PIPELINE",
        "contributor_name": "Demo Validator"
    }, headers=auth_headers)
    assert rpt_res.status_code == 201
    report = rpt_res.json()
    assert report["integrity_status"] == "TRUSTED"
    assert "report_data" in report

    # Get single report
    single_rpt = client.get(f"/api/reports/{report['id']}")
    assert single_rpt.status_code == 200
    assert single_rpt.json()["id"] == report["id"]

def test_contributors(client):
    res = client.get("/api/contributors")
    assert res.status_code == 200
    contributors = res.json()
    assert len(contributors) >= 3

    c_id = contributors[0]["id"]
    activity_res = client.get(f"/api/contributors/{c_id}/activity")
    assert activity_res.status_code == 200
    assert "recent_audit_logs" in activity_res.json()
