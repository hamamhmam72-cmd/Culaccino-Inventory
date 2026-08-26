# Culaccino Inventory — Complete Git Backup

This directory contains a complete Git bundle split into numbered parts.
It preserves the full tracked project and Git history from Replit.

## Restore

```bash
cat culaccino-inventory.bundle.part-* > culaccino-inventory.bundle
sha256sum -c SHA256SUMS
git clone culaccino-inventory.bundle Culaccino-Inventory
cd Culaccino-Inventory
git checkout main
```

The application source is restored inside the cloned `Culaccino-Inventory` directory.
