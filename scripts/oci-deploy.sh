#!/bin/bash
# Deploy Klarity AI to OCI Compute VM
# VM Specs: E5 (VM.Standard.E5.Flex), 2 OCPU, 32 GB RAM
# Prerequisites: OCI CLI installed and configured (oci setup config)

set -e

# --- Configuration (override via env vars) ---
INSTANCE_NAME="${OCI_INSTANCE_NAME:-klarity-ai}"
SHAPE="VM.Standard.E5.Flex"
OCPUS=2
MEMORY_GB=32
COMPARTMENT_ID="${OCI_COMPARTMENT_ID}"
AVAILABILITY_DOMAIN="${OCI_AVAILABILITY_DOMAIN}"
SUBNET_ID="${OCI_SUBNET_ID}"
IMAGE_ID="${OCI_IMAGE_ID}"
SSH_PUBLIC_KEY_FILE="${OCI_SSH_KEY:-$HOME/.ssh/id_rsa.pub}"
GITHUB_REPO="${GITHUB_REPO:-https://github.com/BfShaik/Klarity-AI.git}"

# --- Help ---
usage() {
  cat <<EOF
Deploy Klarity AI to OCI Compute (E5, 2 OCPU, 32 GB RAM)

Usage: $0 [OPTIONS]

Required env vars (or pass as options):
  OCI_COMPARTMENT_ID     OCI compartment OCID
  OCI_AVAILABILITY_DOMAIN  e.g. AD-1, AD-2, AD-3 (or full OCID)
  OCI_SUBNET_ID         Subnet OCID (public or private)
  OCI_IMAGE_ID          (optional) Oracle Linux or Ubuntu image OCID

Optional:
  OCI_INSTANCE_NAME     Instance name (default: klarity-ai)
  OCI_SSH_KEY           Path to SSH public key (default: ~/.ssh/id_rsa.pub)
  GITHUB_REPO           Git repo URL (default: BfShaik/Klarity-AI)

Examples:
  export OCI_COMPARTMENT_ID=ocid1.compartment.oc1..
  export OCI_AVAILABILITY_DOMAIN=AD-1
  export OCI_SUBNET_ID=ocid1.subnet.oc1..
  $0

  # Or discover compartment/AD/subnet:
  $0 --discover
EOF
  exit 1
}

# --- Discover OCI resources ---
discover() {
  echo "=== Discovering OCI resources ==="
  if ! command -v oci &>/dev/null; then
    echo "OCI CLI not found. Install: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
    exit 1
  fi

  echo ""
  echo "Compartments:"
  oci iam compartment list --all --query "data[].{name:name, id:id}" --output table 2>/dev/null || true

  echo ""
  echo "Availability Domains (first compartment):"
  COMP=$(oci iam compartment list --all --query "data[0].id" --raw-output 2>/dev/null)
  if [ -n "$COMP" ]; then
    oci iam availability-domain list -c "$COMP" --query "data[].name" --output table
  fi

  echo ""
  echo "Subnets (first compartment):"
  oci network subnet list -c "${OCI_COMPARTMENT_ID:-$COMP}" --all --query "data[].{name:\"display-name\", id:id, cidr:\"cidr-block\"}" --output table 2>/dev/null || true

  echo ""
  echo "Ubuntu 22.04 images (first 3):"
  oci compute image list -c "${OCI_COMPARTMENT_ID:-$COMP}" --operating-system "Canonical Ubuntu" --operating-system-version "22.04" --limit 3 --query "data[0:3].{name:\"display-name\", id:id}" --output table 2>/dev/null || true

  echo ""
  echo "Oracle Linux 8 images (first 3):"
  oci compute image list -c "${OCI_COMPARTMENT_ID:-$COMP}" --operating-system "Oracle Linux" --operating-system-version "8" --limit 3 --query "data[0:3].{name:\"display-name\", id:id}" --output table 2>/dev/null || true
}

# --- Get latest Ubuntu 22.04 image ---
get_ubuntu_image() {
  local comp="$1"
  oci compute image list -c "$comp" \
    --operating-system "Canonical Ubuntu" \
    --operating-system-version "22.04" \
    --shape "VM.Standard.E5.Flex" \
    --limit 1 \
    --query "data[0].id" --raw-output 2>/dev/null
}

# --- Cloud-init script for VM bootstrap ---
cloud_init_script() {
  local repo="${GITHUB_REPO:-https://github.com/BfShaik/Klarity-AI.git}"
  cat <<CLOUDINIT
#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone and build Klarity AI
APP_DIR=/opt/klarity-ai
mkdir -p "\$APP_DIR"
git clone "$repo" "\$APP_DIR"
cd "\$APP_DIR"

# Create .env.local placeholder (user must update with real values)
touch .env.local

npm ci
npm run build

# Run with PM2
pm2 start npm --name "klarity-ai" -- start
pm2 save
pm2 startup systemd -u root --hp /root

# Allow port 3000 if firewall enabled
ufw allow 3000 2>/dev/null || true
CLOUDINIT
}

# --- Parse args ---
while [[ $# -gt 0 ]]; do
  case $1 in
    --discover) discover; exit 0 ;;
    -h|--help) usage ;;
    *) shift ;;
  esac
done

# --- Validate required vars ---
if [ -z "$COMPARTMENT_ID" ] || [ -z "$AVAILABILITY_DOMAIN" ] || [ -z "$SUBNET_ID" ]; then
  echo "Error: OCI_COMPARTMENT_ID, OCI_AVAILABILITY_DOMAIN, and OCI_SUBNET_ID are required."
  echo "Run '$0 --discover' to list available resources."
  usage
fi

# --- Resolve availability domain ---
AD_OCID=$(oci iam availability-domain list -c "$COMPARTMENT_ID" --query "data[?name=='$AVAILABILITY_DOMAIN'].id | [0]" --raw-output 2>/dev/null)
if [ -z "$AD_OCID" ] || [ "$AD_OCID" == "null" ]; then
  AD_OCID="$AVAILABILITY_DOMAIN"
fi

# --- Get image if not set ---
if [ -z "$IMAGE_ID" ]; then
  echo "Resolving Ubuntu 22.04 image..."
  IMAGE_ID=$(get_ubuntu_image "$COMPARTMENT_ID")
  if [ -z "$IMAGE_ID" ] || [ "$IMAGE_ID" == "null" ]; then
    echo "Could not find Ubuntu 22.04 image. Set OCI_IMAGE_ID manually."
    exit 1
  fi
  echo "Using image: $IMAGE_ID"
fi

# --- SSH key ---
if [ ! -f "$SSH_PUBLIC_KEY_FILE" ]; then
  echo "SSH public key not found at $SSH_PUBLIC_KEY_FILE"
  echo "Generate with: ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ''"
  exit 1
fi
SSH_KEY=$(cat "$SSH_PUBLIC_KEY_FILE")

# --- Cloud-init ---
CI_SCRIPT=$(cloud_init_script)
CI_B64=$(echo "$CI_SCRIPT" | base64 | tr -d '\n')

# --- Launch instance ---
echo "=== Launching OCI Compute instance ==="
echo "  Name: $INSTANCE_NAME"
echo "  Shape: $SHAPE (${OCPUS} OCPU, ${MEMORY_GB} GB RAM)"
echo "  Compartment: $COMPARTMENT_ID"
echo "  Subnet: $SUBNET_ID"
echo ""

INSTANCE_JSON=$(oci compute instance launch \
  --display-name "$INSTANCE_NAME" \
  --compartment-id "$COMPARTMENT_ID" \
  --availability-domain "$AD_OCID" \
  --shape "$SHAPE" \
  --shape-config "{\"ocpus\": $OCPUS, \"memoryInGBs\": $MEMORY_GB}" \
  --image-id "$IMAGE_ID" \
  --subnet-id "$SUBNET_ID" \
  --metadata "{\"ssh_authorized_keys\": \"$SSH_KEY\"}" \
  --user-data "$CI_B64" \
  --assign-public-ip true \
  --output json)

INSTANCE_ID=$(echo "$INSTANCE_JSON" | jq -r '.data.id')
echo "Instance launched: $INSTANCE_ID"
echo ""
echo "Waiting for instance to reach RUNNING state..."
oci compute instance wait --instance-id "$INSTANCE_ID" --wait-for-state RUNNING

# --- Get public IP ---
PUBLIC_IP=$(oci compute instance list-vnics --instance-id "$INSTANCE_ID" --query "data[0].\"public-ip\"" --raw-output 2>/dev/null || echo "")

echo ""
echo "=== Deployment complete ==="
echo "Instance ID: $INSTANCE_ID"
echo "Public IP:   ${PUBLIC_IP:-<check OCI Console>}"
echo ""
echo "Cloud-init is installing Node.js and deploying the app. This may take 5-10 minutes."
echo "SSH when ready: ssh ubuntu@${PUBLIC_IP:-<IP>}"
echo "Check status:   ssh ubuntu@${PUBLIC_IP:-<IP>} 'pm2 status'"
echo "App URL:       http://${PUBLIC_IP:-<IP>}:3000"
echo ""
echo "Ensure security list allows inbound TCP 3000 if needed."
