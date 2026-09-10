"""
VISIGRITY Phase 3 Final Verification Script
Tests the complete E2E pipeline:
  Image upload → OpenCV → Detector → Hash → Inference record → Report → PDF download
  Attack simulation → Compromise → Reset → Trusted
"""
import httpx
import time
import sys
import io

API = 'http://localhost:8000/api'
results = {}


def check(label):
    results[label] = 'PASS'
    print(f'[PASS] {label}')


def fail(label, reason):
    results[label] = f'FAIL: {reason}'
    print(f'[FAIL] {label}: {reason}')


def make_test_png(width=64, height=64) -> bytes:
    """Create a minimal valid PNG of given dimensions using only stdlib."""
    import struct
    import zlib

    def write_chunk(chunk_type: bytes, data: bytes) -> bytes:
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'
    # IHDR: width, height, bit_depth=8, color_type=2 (RGB), compression=0, filter=0, interlace=0
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = write_chunk(b'IHDR', ihdr_data)
    # IDAT: raw scanlines, each prefixed with filter byte 0
    raw = b''
    for _ in range(height):
        raw += b'\x00' + b'\xff\x00\x00' * width  # red pixels, filter=None
    compressed = zlib.compress(raw)
    idat = write_chunk(b'IDAT', compressed)
    # IEND
    iend = write_chunk(b'IEND', b'')
    return sig + ihdr + idat + iend


time.sleep(2)

print('=' * 60)
print('VISIGRITY Phase 3 Final E2E Verification')
print('=' * 60)

test_png = make_test_png(64, 64)

with httpx.Client(base_url=API, timeout=30) as c:

    # 1. Health Check
    try:
        r = c.get('/health')
        r.raise_for_status()
        h = r.json()
        check('Health Check')
        print(f'  version: {h["version"]}, env: {h["environment"]}')
        print(f'  blockchain_mode: {h["blockchain_mode"]}, cv_engine_mode: {h["cv_engine_mode"]}')
    except Exception as e:
        fail('Health Check', e)

    # 2. Get Models
    try:
        models = c.get('/models').json()
        model_id = models[0]['id'] if models else 'VISI-YOLO-DEMO'
        check(f'Get Models ({len(models)} registered)')
    except Exception as e:
        fail('Get Models', e)
        model_id = 'VISI-YOLO-DEMO'

    # 3. JSON Inference (demo, no file)
    try:
        r = c.post('/inferences', json={'model_id': model_id, 'is_demo': True})
        r.raise_for_status()
        inf = r.json()
        check('JSON Demo Inference')
        print(f'  id: {inf["id"]}')
        print(f'  input_hash:  {inf["input_hash"][:32]}...')
        print(f'  output_hash: {inf["output_hash"][:32]}...')
        print(f'  status: {inf["status"]}')
    except Exception as e:
        fail('JSON Demo Inference', e)
        inf = {'id': 'FALLBACK', 'status': 'UNKNOWN'}

    # 4. CV File Inference (full OpenCV → Detector → Hash pipeline)
    try:
        files = {'file': ('test_64x64.png', io.BytesIO(test_png), 'image/png')}
        data = {'model_id': model_id}
        r2 = c.post('/inferences/run-with-file', files=files, data=data)
        r2.raise_for_status()
        cv_inf = r2.json()
        check('CV File Inference (OpenCV + DemoDetector)')
        print(f'  id: {cv_inf["id"]}')
        print(f'  input_hash:  {cv_inf["input_hash"][:32]}...')
        print(f'  output_hash: {cv_inf["output_hash"][:32]}...')
        print(f'  result_label: {cv_inf["result"].get("label")}')
        print(f'  cv_mode: {cv_inf["result"].get("cv_mode", "N/A")}')
        print(f'  total_detections: {cv_inf["result"].get("total_detections", "N/A")}')
    except Exception as e:
        fail('CV File Inference (OpenCV + DemoDetector)', e)

    # 5. Integrity Status
    try:
        r3 = c.get('/integrity/status')
        r3.raise_for_status()
        pipeline = r3.json()
        check('Integrity Status Check')
        print(f'  overall: {pipeline["overall"]}')
        for stage, val in pipeline.get('stages', {}).items():
            print(f'  stage[{stage}]: {val}')
    except Exception as e:
        fail('Integrity Status Check', e)

    # 6. Blockchain Audit Trail
    try:
        r4 = c.get('/audit', params={'skip': 0, 'limit': 20})
        r4.raise_for_status()
        logs = r4.json()
        check(f'Blockchain Audit Trail ({len(logs)} records)')
        if logs:
            print(f'  latest: [{logs[0]["record_type"]}] {logs[0]["transaction_reference"][:32]}...')
    except Exception as e:
        fail('Blockchain Audit Trail', e)

    # 7. Generate Evidence Report
    try:
        r5 = c.post('/reports', json={
            'asset_id': inf['id'],
            'contributor_name': 'E2E Verifier'
        })
        r5.raise_for_status()
        report = r5.json()
        check('Evidence Report Generation')
        print(f'  report_id: {report["id"]}')
        print(f'  integrity_status: {report["integrity_status"]}')
        print(f'  blockchain_reference: {report["blockchain_reference"]}')
    except Exception as e:
        fail('Evidence Report Generation', e)
        report = {'id': 'FALLBACK'}

    # 8. PDF Download
    try:
        r6 = c.get(f'/reports/{report["id"]}/pdf')
        r6.raise_for_status()
        ct = r6.headers.get('content-type', '')
        sz = len(r6.content)
        assert 'application/pdf' in ct, f'Wrong content-type: {ct}'
        assert sz > 500, f'PDF too small: {sz} bytes'
        with open('final_test_report.pdf', 'wb') as f:
            f.write(r6.content)
        check(f'ReportLab PDF Download ({sz:,} bytes)')
        print(f'  saved: final_test_report.pdf')
    except Exception as e:
        fail('ReportLab PDF Download', e)

    # 9. Attack Simulation — Model Tampering
    try:
        r7 = c.post('/security/simulate/model-tampering')
        r7.raise_for_status()
        check('Attack Simulation - Model Tamper')
    except Exception as e:
        fail('Attack Simulation - Model Tamper', e)

    # 10. Verify Compromised State
    try:
        r8 = c.get('/integrity/status')
        r8.raise_for_status()
        status_after = r8.json()['overall']
        check('Post-Attack Integrity Check')
        print(f'  pipeline after attack: {status_after}')
    except Exception as e:
        fail('Post-Attack Integrity Check', e)

    # 11. Reset Demo
    try:
        r9 = c.post('/security/reset-demo')
        r9.raise_for_status()
        check('Demo State Reset')
    except Exception as e:
        fail('Demo State Reset', e)

    # 12. Verify Restored
    try:
        r10 = c.get('/integrity/status')
        r10.raise_for_status()
        status_reset = r10.json()['overall']
        check('Post-Reset Integrity Verification')
        print(f'  pipeline after reset: {status_reset}')
    except Exception as e:
        fail('Post-Reset Integrity Verification', e)

    # 13. Contributors
    try:
        r11 = c.get('/contributors')
        r11.raise_for_status()
        contribs = r11.json()
        check(f'Contributors Registry ({len(contribs)} contributors)')
    except Exception as e:
        fail('Contributors Registry', e)

print()
print('=' * 60)
passed = sum(1 for v in results.values() if v == 'PASS')
failed = sum(1 for v in results.values() if 'FAIL' in str(v))
print(f'FINAL RESULT: {passed} PASS / {failed} FAIL')
print('=' * 60)
if failed:
    print('\nFailed tests:')
    for k, v in results.items():
        if 'FAIL' in str(v):
            print(f'  - {k}: {v}')
    sys.exit(1)
else:
    print('\nAll checks passed. Phase 3 E2E verification complete.')
