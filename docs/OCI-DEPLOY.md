# Deploy Klarity AI to OCI Compute (E5, 2 OCPU, 32 GB RAM)

Deploy the app to an Oracle Cloud Infrastructure compute VM using the OCI CLI.

## Prerequisites

1. **OCI CLI** installed and configured:
   ```bash
   # Install (macOS)
   brew install oci-cli

   # Configure
   oci setup config
   # Follow prompts: user OCID, tenancy OCID, region, fingerprint, key path
   ```

2. **jq** (for JSON parsing):
   ```bash
   brew install jq
   ```

3. **SSH key** for instance access:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ''
   ```

4. **OCI resources** (VCN, subnet). If you don't have them:
   - Create a VCN in OCI Console → Networking → Virtual Cloud Networks
   - Create a **public** subnet (for `--assign-public-ip true`)
   - Ensure security list allows inbound TCP 22 (SSH) and 3000 (app)

## Quick Start

### 1. Discover your OCI resources

```bash
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1..aaaaaaaa...
export OCI_AVAILABILITY_DOMAIN=AD-1
export OCI_SUBNET_ID=ocid1.subnet.oc1..aaaaaaaa...

./scripts/oci-deploy.sh --discover
```

### 2. Set environment variables

```bash
export OCI_COMPARTMENT_ID=ocid1.compartment.oc1..aaaaaaaa...
export OCI_AVAILABILITY_DOMAIN=AD-1
export OCI_SUBNET_ID=ocid1.subnet.oc1..aaaaaaaa...

# Optional
export OCI_INSTANCE_NAME=klarity-ai
export OCI_SSH_KEY=~/.ssh/id_rsa.pub
export GITHUB_REPO=https://github.com/BfShaik/Klarity-AI.git
```

### 3. Run the deployment script

```bash
chmod +x scripts/oci-deploy.sh
./scripts/oci-deploy.sh
```

The script will:

- Launch a VM with **VM.Standard.E5.Flex** (2 OCPU, 32 GB RAM)
- Use Ubuntu 22.04 (auto-resolved if `OCI_IMAGE_ID` not set)
- Run cloud-init to install Node.js 20, clone the repo, build, and start with PM2
- Output the instance ID and public IP

### 4. Post-deployment

1. **Add env vars** — SSH into the VM and create `.env.local`:
   ```bash
   ssh ubuntu@<PUBLIC_IP>
   sudo nano /opt/klarity-ai/.env.local
   # Add: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OCI_GENAI_API_KEY
   sudo pm2 restart klarity-ai
   ```

2. **Open security list** — In OCI Console → Networking → Security Lists, add:
   - Ingress: TCP 3000, source 0.0.0.0/0 (or your IP)

3. **Access the app** — `http://<PUBLIC_IP>:3000`

## VM Specs

| Spec | Value |
|------|-------|
| Shape | VM.Standard.E5.Flex |
| OCPUs | 2 |
| Memory | 32 GB |
| Image | Ubuntu 22.04 (default) |

## Alternative: Docker on the VM

If you prefer Docker:

1. Launch the VM manually (or use the script and skip cloud-init).
2. SSH in and install Docker.
3. Build and run:
   ```bash
   docker build -t klarity-ai .
   docker run -d -p 3000:3000 --env-file .env.local klarity-ai
   ```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `oci: command not found` | Install OCI CLI: `brew install oci-cli` |
| `Not authenticated` | Run `oci setup config` |
| No public IP | Use a **public** subnet; ensure `--assign-public-ip true` |
| Port 3000 not reachable | Add ingress rule to subnet's security list |
| Cloud-init failed | SSH in and check `/var/log/cloud-init-output.log` |
| App not running | `ssh ubuntu@<IP> 'pm2 logs klarity-ai'` |
