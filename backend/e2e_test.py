import httpx
import time
import os

API_BASE_URL = "http://localhost:8000/api"

def run_e2e_test():
    print("--- Starting Visigrity Phase 3 E2E Verification ---")
    
    with httpx.Client(base_url=API_BASE_URL) as client:
        # 1. Health check
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] Backend Health Check")
        
        # 2. Get Models
        res = client.get("/models")
        assert res.status_code == 200
        models = res.json()
        assert len(models) > 0, "No models found"
        model_id = models[0]['id']
        print(f"[PASS] Retrieved Models (Selected: {model_id})")
        
        # 3. Create Inference
        res = client.post("/inferences", json={
            "model_id": model_id,
            "input_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "is_demo": True
        })
        assert res.status_code == 201, f"Inference creation failed: {res.text}"
        inference = res.json()
        inf_id = inference['id']
        print(f"[PASS] Created Inference (ID: {inf_id})")
        
        # 4. Verify Integrity
        res = client.get("/integrity/status")
        assert res.status_code == 200
        integrity = res.json()
        print(f"[PASS] Pipeline Integrity Status: {integrity['overall']}")
        
        # 5. Get Audit Logs
        res = client.get(f"/audit/{inf_id}")
        assert res.status_code == 200
        audits = res.json()
        print(f"[PASS] Audit Logs Retrieved ({len(audits)} records)")
        
        # 6. Generate Report
        res = client.post("/reports", json={
            "asset_id": inf_id,
            "contributor_name": "E2E Test Runner"
        })
        assert res.status_code == 201, f"Report generation failed: {res.text}"
        report = res.json()
        report_id = report['id']
        print(f"[PASS] Generated Compliance Report (ID: {report_id})")
        
        # 7. Download PDF
        res = client.get(f"/reports/{report_id}/pdf")
        assert res.status_code == 200, f"PDF download failed: {res.status_code}"
        assert res.headers['content-type'] == 'application/pdf'
        assert len(res.content) > 1000, "PDF seems too small/empty"
        with open("e2e_test.pdf", "wb") as f:
            f.write(res.content)
        print("[PASS] PDF Dossier Downloaded Successfully (Size: {} bytes)".format(len(res.content)))
        
    print("--- E2E Verification Completed Successfully ---")

if __name__ == "__main__":
    run_e2e_test()
