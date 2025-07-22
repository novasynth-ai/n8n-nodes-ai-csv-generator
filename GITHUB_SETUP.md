# GitHub Setup Guide for Automated npm Publishing

This guide will help you set up a GitHub repository with automated npm publishing for your n8n AI CSV Generator node.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `n8n-nodes-ai-csv-generator`
3. Make it public (required for npm publishing)
4. Don't initialize with README (we have our own files)

## Step 2: Get npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click your profile → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" (for CI/CD)
5. Copy the token (you'll need it for GitHub secrets)

## Step 3: Configure GitHub Secrets

1. In your GitHub repository, go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:
   - **Name**: `NPM_TOKEN`
   - **Value**: Your npm access token from Step 2

## Step 4: Upload Your Code

### Option A: Using GitHub Web Interface

1. In your repository, click "uploading an existing file"
2. Drag and drop all the files from the zip package
3. Commit the files

### Option B: Using Git Commands

```bash
# Clone the empty repository
git clone https://github.com/your-username/n8n-nodes-ai-csv-generator.git
cd n8n-nodes-ai-csv-generator

# Copy all files from the package
# (extract the zip and copy all files to this directory)

# Add and commit
git add .
git commit -m "Initial commit: AI CSV Generator n8n node"
git push origin main
```

### Option C: Using Project IDX (Your Preferred IDE)

1. Open Project IDX
2. Import the GitHub repository
3. Upload/copy all the package files
4. Commit and push through the IDE

## Step 5: Test the Setup

Once you've uploaded the code, the GitHub Actions workflow is ready but won't run until you create a release.

### Manual Publishing (First Time)

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "Publish to npm" workflow
4. Click "Run workflow"
5. Select version bump type (patch/minor/major)
6. Click "Run workflow"

This will:
- Build the package
- Bump the version
- Publish to npm
- Create a GitHub release

### Automatic Publishing (Future Updates)

For future updates, you can publish automatically by creating tags:

```bash
# Bump version and create tag
npm version patch  # or minor/major
git push origin main --tags
```

This will automatically trigger the publishing workflow.

## Step 6: Install on Your GCP VM

Once published, installation becomes super simple:

```bash
# SSH into your GCP VM
gcloud compute ssh your-instance-name --zone=your-zone

# Install the package
npm install -g @smiles-are-always/n8n-nodes-ai-csv-generator

# Configure n8n
mkdir -p ~/.n8n
cat > ~/.n8n/config.json << 'EOF'
{
  "nodes": {
    "include": ["@smiles-are-always/n8n-nodes-ai-csv-generator"]
  }
}
EOF

# Restart n8n
sudo systemctl restart n8n
```

## Workflow Features

The GitHub Actions workflow includes:

- **Automated Building**: Compiles TypeScript and prepares the package
- **Version Management**: Automatically bumps version numbers
- **npm Publishing**: Publishes to npm registry with public access
- **GitHub Releases**: Creates releases with installation instructions
- **Manual Triggers**: Allows manual publishing through GitHub interface

## Updating the Node

To update the node in the future:

1. Make your code changes
2. Commit and push to GitHub
3. Either:
   - Run the workflow manually from GitHub Actions
   - Create a version tag: `git tag v1.0.1 && git push --tags`

The package will be automatically built and published to npm.

## Troubleshooting

### Publishing Fails

- Check that `NPM_TOKEN` secret is set correctly
- Ensure your npm account has publishing rights to the `@smiles-are-always` scope
- Verify the package name in package.json matches your npm scope

### Build Fails

- Check the Actions tab for detailed error logs
- Ensure all dependencies are listed in package.json
- Verify TypeScript compilation works locally

### Node Not Appearing in n8n

- Check that the package was published successfully on npmjs.com
- Verify n8n configuration includes the correct package name
- Restart n8n completely after installation

## Benefits of This Setup

1. **Automated**: No manual npm commands needed
2. **Version Control**: All changes tracked in Git
3. **Professional**: Proper CI/CD pipeline
4. **Reliable**: Consistent build and publish process
5. **Collaborative**: Team members can contribute easily
6. **Rollback**: Easy to revert to previous versions

This setup makes maintaining and updating your n8n node much easier!

