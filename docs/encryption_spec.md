# Encryption Specification

To ensure End-to-End Encryption (E2EE), both the Android app (Dart) and the Web apps (TypeScript) must use the same encryption algorithm and parameters.

## Algorithm
- **AES-256-CBC**
- **Padding**: PKCS7

## Key Derivation
- The invitation code is a Base64 encoded string of `busId:secretKey`.
- `busId`: The Firestore document ID for the bus.
- `secretKey`: A 32-byte (256-bit) random string used as the AES key.
- The `IV` (Initialization Vector) should be unique for each encryption and stored alongside the ciphertext (e.g., `iv:ciphertext`).

## Data Format in Firestore
All sensitive fields will be stored as strings in the format:
`iv_base64:ciphertext_base64`

### Sensitive Fields:
- Bus current latitude/longitude
- Bus stop names
- Parent names
- Parent classes
- Route names
- Vehicle numbers
