import re

VALID_ROLES = [
    "ADMIN",
    "DATA CONTRIBUTOR",
    "MODEL DEVELOPER",
    "VALIDATOR",
    "INFERENCE OPERATOR"
]

def is_valid_sha256(hash_str: str) -> bool:
    """Validate if a string is a 64-character hexadecimal SHA-256 hash."""
    if not hash_str or len(hash_str) != 64:
        return False
    return bool(re.match(r"^[a-fA-F0-9]{64}$", hash_str))

def validate_role(role: str) -> bool:
    """Check if the provided role is in the supported VISIGRITY roles."""
    return role.upper() in VALID_ROLES
