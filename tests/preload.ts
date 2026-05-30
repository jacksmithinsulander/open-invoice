process.env.AI_MODEL ??= "test-model";

// In nix-shell, MONGO_* are exported from .env before tests run (see shell.nix).
// These fallbacks only apply outside the dev shell.
process.env.MONGO_APP ??= "invoice_test";
process.env.MONGO_USER ??= "testuser";
process.env.MONGO_PASS ??= "testpass";
process.env.MONGO_PORT ??= "localhost:27017";
