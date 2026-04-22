# app/models/enums.py

from enum import Enum

class UserRoleEnum(Enum):
    ADMIN = "Admin"
    CUSTOMER = "Customer"

class RiskLevelEnum(Enum):
    LOW = 1
    LOW_MEDIUM = 2
    MEDIUM = 3
    MEDIUM_HIGH = 4
    HIGH = 5

class AssetTypeEnum(Enum):
    STOCK = "Stock"
    BOND = "Bond"
    REAL_ESTATE = "Real Estate"
    CRYPTO = "Crypto"
    FIXED_DEPOSIT = "Fixed Deposit"

    