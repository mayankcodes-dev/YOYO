// ============================================================
// YOYO Hotel Booking — Jenkins Declarative Pipeline
// Domain  : mayankcodes.dev
// Backend : api.yoyo.mayankcodes.dev  (AWS EC2 t2.micro)
// Frontend: yoyo.mayankcodes.dev      (Vercel)
// Jenkins : jenkins.mayankcodes.dev   (same EC2)
// ============================================================

pipeline {

    agent any

    // ---------------------------------------------------------------------------
    // Global environment – non-secret values declared here.
    // Secrets are pulled from Jenkins Credentials Store (see 'credentials' blocks).
    // ---------------------------------------------------------------------------
    environment {
        // Node version (must match the NodeJS installer tool configured in
        // Jenkins → Manage Jenkins → Tools → NodeJS Installations → "NodeJS-20")
        NODE_VERSION     = '20'

        // Paths inside the workspace
        SERVER_DIR       = 'server'
        CLIENT_DIR       = 'client'

        // PM2 process name on the EC2 server
        PM2_APP_NAME     = 'yoyo-server'

        // Remote repo path on the EC2 server (must match where you cloned it)
        REMOTE_APP_DIR   = '/home/ubuntu/yoyo'

        // Vercel project details (non-secret; ORG/PROJECT IDs are bound below
        // from credentials so they can be rotated without editing this file)
        VERCEL_CLI_VERSION = 'latest'
    }

    // ---------------------------------------------------------------------------
    // Jenkins tools — must be pre-configured in Manage Jenkins → Tools
    // ---------------------------------------------------------------------------
    tools {
        nodejs "NodeJS-20"
    }

    // ---------------------------------------------------------------------------
    // Pipeline options
    // ---------------------------------------------------------------------------
    options {
        // Keep only the last 10 builds to save disk on the t2.micro
        buildDiscarder(logRotator(numToKeepStr: '10'))

        // Abort builds that have been running longer than 30 minutes
        timeout(time: 30, unit: 'MINUTES')

        // Show timestamps in console output
        timestamps()

        // Do not run concurrent builds — prevents race conditions on the EC2
        disableConcurrentBuilds()
    }

    // ---------------------------------------------------------------------------
    // Stages
    // ---------------------------------------------------------------------------
    stages {

        // ------------------------------------------------------------------ //
        // STAGE 1 — Checkout
        // ------------------------------------------------------------------ //
        stage('Checkout') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 1 › Checkout source code'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                // Standard git checkout — Jenkins fills this in automatically
                // when the Pipeline job is linked to the GitHub repository.
                checkout scm

                // Print the commit SHA and branch for traceability
                sh '''
                    echo "Branch : $(git rev-parse --abbrev-ref HEAD)"
                    echo "Commit : $(git rev-parse HEAD)"
                    echo "Author : $(git log -1 --format='%an <%ae>')"
                    echo "Message: $(git log -1 --format='%s')"
                '''
            }
        }

        // ------------------------------------------------------------------ //
        // STAGE 2 — Install Server Dependencies
        // ------------------------------------------------------------------ //
        stage('Install Server Dependencies') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 2 › Install server (Node.js) dependencies'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                dir("${SERVER_DIR}") {
                    // npm ci performs a clean install using package-lock.json —
                    // much faster and more reliable than npm install in CI.
                    sh 'npm ci'
                    sh 'echo "Server dependencies installed successfully."'
                    sh 'npm list --depth=0'
                }
            }
        }

        // ------------------------------------------------------------------ //
        // STAGE 3 — Run Server Tests
        // ------------------------------------------------------------------ //
        stage('Run Server Tests') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 3 › Run Jest unit / integration tests'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                dir("${SERVER_DIR}") {
                    sh '''
                        NODE_OPTIONS='--experimental-vm-modules' \
                        npx jest \
                            --coverage \
                            --ci \
                            --forceExit \
                            --detectOpenHandles \
                            --reporters=default \
                            --reporters=jest-junit
                    '''
                }
            }

            post {
                always {
                    // Publish JUnit XML results so Jenkins shows a test trend graph
                    junit allowEmptyResults: true,
                          testResults: "${SERVER_DIR}/junit.xml"

                    // Publish HTML coverage report
                    publishHTML(target: [
                        allowMissing          : true,
                        alwaysLinkToLastBuild : true,
                        keepAll               : true,
                        reportDir             : "${SERVER_DIR}/coverage/lcov-report",
                        reportFiles           : 'index.html',
                        reportName            : 'Jest Coverage Report'
                    ])
                }

                failure {
                    echo '⛔  Tests FAILED — aborting pipeline.'
                }
            }
        }

        // ------------------------------------------------------------------ //
        // STAGE 4 — Install Client Dependencies
        // ------------------------------------------------------------------ //
        stage('Install Client Dependencies') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 4 › Install client (React/Vite) dependencies'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                dir("${CLIENT_DIR}") {
                    sh 'npm ci'
                    sh 'echo "Client dependencies installed successfully."'
                    sh 'npm list --depth=0'
                }
            }
        }

        // ------------------------------------------------------------------ //
        // STAGE 5 — Build Client
        // ------------------------------------------------------------------ //
        stage('Build Client') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 5 › Build the React/Vite production bundle'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                dir("${CLIENT_DIR}") {
                    // VITE_API_URL is injected at build time so the bundle
                    // points at the correct backend URL.
                    sh '''
                        VITE_API_URL=https://api.yoyo.mayankcodes.dev \
                        npm run build
                    '''

                    // Show the size of the generated bundle
                    sh 'du -sh dist/'
                    sh 'ls -lh dist/'
                }
            }

            post {
                success {
                    // Archive the build artifact so it can be downloaded from Jenkins
                    archiveArtifacts artifacts: "${CLIENT_DIR}/dist/**",
                                     fingerprint: true,
                                     allowEmptyArchive: false
                }
            }
        }

        // ------------------------------------------------------------------ //
        // STAGE 6 — Deploy Backend (SSH to EC2)
        // ------------------------------------------------------------------ //
        stage('Deploy Backend') {
            // Only deploy when on the main branch
            when {
                branch 'main'
            }

            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 6 › Deploy backend to AWS EC2 via SSH'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                // Pull EC2 host and username from Jenkins credentials (Secret Text)
                withCredentials([
                    string(credentialsId: 'EC2_HOST', variable: 'EC2_HOST'),
                    string(credentialsId: 'EC2_USER', variable: 'EC2_USER'),
                    // EC2_SSH_KEY must be stored as an "SSH Username with private key"
                    // credential in Jenkins — sshagent will add it to the ssh-agent
                    // so the ssh command picks it up automatically.
                    sshUserPrivateKey(
                        credentialsId : 'EC2_SSH_KEY',
                        keyFileVariable: 'SSH_KEY_FILE',
                        usernameVariable: 'SSH_USERNAME'
                    )
                ]) {
                    // Use the SSH Agent plugin to handle key forwarding cleanly
                    sshagent(credentials: ['EC2_SSH_KEY']) {
                        sh '''
                            echo "Deploying to ${EC2_USER}@${EC2_HOST} …"

                            ssh -o StrictHostKeyChecking=no \
                                -o ConnectTimeout=30 \
                                ${EC2_USER}@${EC2_HOST} << 'ENDSSH'

                                set -euo pipefail

                                echo "==> Navigating to app directory"
                                cd /home/ubuntu/yoyo

                                echo "==> Pulling latest code from GitHub"
                                git fetch origin main
                                git reset --hard origin/main

                                echo "==> Installing production server dependencies"
                                cd server
                                npm ci --omit=dev

                                echo "==> Reloading PM2 process (zero-downtime)"
                                pm2 reload yoyo-server --update-env

                                echo "==> Saving PM2 process list"
                                pm2 save

                                echo "==> Deployment complete — current PM2 status:"
                                pm2 list

                                echo "==> Last 20 server log lines:"
                                pm2 logs yoyo-server --nostream --lines 20

ENDSSH
                        '''
                    }
                }

                echo '✅  Backend deployed successfully.'
            }
        }

        // ------------------------------------------------------------------ //
        // STAGE 7 — Deploy Frontend (Vercel)
        // ------------------------------------------------------------------ //
        stage('Deploy Frontend') {
            // Only deploy when on the main branch
            when {
                branch 'main'
            }

            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo ' Stage 7 › Deploy frontend to Vercel'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                withCredentials([
                    string(credentialsId: 'VERCEL_TOKEN',      variable: 'VERCEL_TOKEN'),
                    string(credentialsId: 'VERCEL_ORG_ID',     variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'VERCEL_PROJECT_ID', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    dir("${CLIENT_DIR}") {
                        sh '''
                            echo "Installing Vercel CLI …"
                            npm install --global vercel@${VERCEL_CLI_VERSION} --quiet

                            echo "Vercel CLI version: $(vercel --version)"

                            echo "Deploying to Vercel (production) …"
                            vercel deploy \
                                --prod \
                                --yes \
                                --token="${VERCEL_TOKEN}" \
                                --scope="${VERCEL_ORG_ID}" \
                                --env VITE_API_URL=https://api.yoyo.mayankcodes.dev \
                                --build-env VITE_API_URL=https://api.yoyo.mayankcodes.dev \
                                2>&1 | tee vercel-deploy.log

                            echo "Vercel deployment URL:"
                            grep -oP 'https://[a-zA-Z0-9._-]+\.vercel\.app' vercel-deploy.log | tail -1 || true
                        '''
                    }
                }

                echo '✅  Frontend deployed successfully to yoyo.mayankcodes.dev'
            }

            post {
                always {
                    // Archive the Vercel deploy log
                    archiveArtifacts artifacts: "${CLIENT_DIR}/vercel-deploy.log",
                                     allowEmptyArchive: true
                }
            }
        }

    } // end stages

    // ---------------------------------------------------------------------------
    // Post — runs after ALL stages regardless of outcome
    // ---------------------------------------------------------------------------
    post {

        always {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo ' Post › Archiving test results and artifacts'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

            // Always archive JUnit XML even if the stage already did it
            junit allowEmptyResults: true,
                  testResults: '**/junit.xml'

            // Clean up node_modules to save disk space on the t2.micro
            sh '''
                echo "Cleaning up workspace to save disk space …"
                rm -rf server/node_modules client/node_modules client/dist || true
                df -h /
            '''
        }

        success {
            echo '🎉  Pipeline completed SUCCESSFULLY!'
            echo "    Build #${env.BUILD_NUMBER} on branch ${env.BRANCH_NAME}"
            echo "    Duration: ${currentBuild.durationString}"

            // Optional: send a Slack / email notification on success
            // mail to: 'mayank@mayankcodes.dev',
            //      subject: "✅ YOYO Build #${env.BUILD_NUMBER} Passed",
            //      body: "All stages passed.\nSee: ${env.BUILD_URL}"
        }

        failure {
            echo '🚨  Pipeline FAILED!'
            echo "    Build #${env.BUILD_NUMBER} on branch ${env.BRANCH_NAME}"
            echo "    Duration: ${currentBuild.durationString}"
            echo "    Console: ${env.BUILD_URL}console"

            // Send email notification on failure
            // Requires the "Email Extension" plugin and SMTP configured in
            // Manage Jenkins → Configure System → Extended E-mail Notification
            emailext(
                subject: "🚨 YOYO CI/CD Build #${env.BUILD_NUMBER} FAILED — ${env.BRANCH_NAME}",
                body: """
                    <h2>Build Failed</h2>
                    <p><strong>Project:</strong> YOYO Hotel Booking</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Build #:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                    <p><strong>Failed Stage:</strong> ${env.STAGE_NAME ?: 'Unknown'}</p>
                    <p>
                        <a href="${env.BUILD_URL}console">View Console Output</a> |
                        <a href="${env.BUILD_URL}">View Build</a>
                    </p>
                """,
                mimeType: 'text/html',
                to: 'mayank@mayankcodes.dev',
                recipientProviders: [
                    [$class: 'DevelopersRecipientProvider'],
                    [$class: 'RequesterRecipientProvider']
                ]
            )
        }

        unstable {
            echo '⚠️  Pipeline is UNSTABLE (tests may have failed).'
        }

        aborted {
            echo '⏹️  Pipeline was ABORTED.'
        }
    }

} // end pipeline
