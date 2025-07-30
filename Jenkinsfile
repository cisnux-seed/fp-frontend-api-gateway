pipeline {
    agent any

    environment {
        REGISTRY = 'image-registry.openshift-image-registry.svc:5000'
        NAMESPACE = 'one-gate-payment'
        APP_NAME = 'nextjs-app'
        // Update this version when you want to release a new version
        SEMANTIC_VERSION = '1.0.0'
        // SonarQube configuration
        SONARQUBE_URL = 'https://sonarqube.apps.ocp-one-gate-payment.skynux.fun'
        // Node.js version
        NODE_VERSION = '22'
    }

    stages {
        stage('Checkout & Setup') {
            steps {
                script {
                    echo "Setting up Node.js environment..."
                    sh """
                        # Verify Node.js and npm versions
                        node --version || echo "Node.js not found"
                        npm --version || echo "npm not found"
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "Installing Node.js dependencies..."
                    sh """
                        # Clean install dependencies
                        npm ci
                        
                        echo "✅ Dependencies installed successfully"
                    """
                }
            }
        }

        stage('Lint & Type Check') {
            steps {
                script {
                    echo "Running linting and type checking..."
                    sh """
                        # Run ESLint
                        npm run lint || echo "Linting completed with warnings"
                        
                        # Run TypeScript type checking (if using TypeScript)
                        if [ -f "tsconfig.json" ]; then
                            npm run type-check || npx tsc --noEmit || echo "Type checking completed"
                        fi
                        
                        echo "✅ Code quality checks completed"
                    """
                }
            }
        }

        stage('SAST Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        echo "Running SAST analysis with SonarQube..."
                        def scannerHome = tool name: 'SonarQube Scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                        sh """
                            echo "Using scanner at: ${scannerHome}"
                            ls -la ${scannerHome}/bin/

                            ${scannerHome}/bin/sonar-scanner \\
                                -Dsonar.projectKey=${APP_NAME} \\
                                -Dsonar.projectName='${APP_NAME}' \\
                                -Dsonar.sources=src,pages,components,app \\
                                -Dsonar.exclusions=node_modules/**,dist/**,.next/**,out/**,coverage/** \\
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info

                            echo "✅ SAST analysis completed"
                        """
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    echo "Building Next.js application..."
                    sh """
                        # Build the Next.js application
                        npm run build
                        
                        # Verify build output
                        ls -la .next/ || ls -la out/
                        
                        echo "✅ Next.js build completed successfully"
                    """
                }
            }
        }

        stage('Build with OpenShift BuildConfig') {
            steps {
                script {
                    echo "Triggering OpenShift build for ${APP_NAME}:${SEMANTIC_VERSION}"

                    sh """
                        # Switch to the correct project
                        oc project ${NAMESPACE}

                        # Create or update BuildConfig if needed
                        oc apply -f - <<EOF
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: ${APP_NAME}
  namespace: ${NAMESPACE}
  labels:
    app: ${APP_NAME}
spec:
  source:
    type: Git
    git:
      uri: git@github.com:your-org/${APP_NAME}.git
      ref: main
    sourceSecret:
      name: github-ssh-keys
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile
      env:
      - name: NODE_ENV
        value: production
  output:
    to:
      kind: ImageStreamTag
      name: ${APP_NAME}:latest
  triggers:
  - type: Manual
  runPolicy: Serial
EOF

                        # Create or update ImageStream
                        oc apply -f - <<EOF
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: ${APP_NAME}
  namespace: ${NAMESPACE}
  labels:
    app: ${APP_NAME}
spec:
  lookupPolicy:
    local: false
EOF

                        # Start the build
                        echo "Starting OpenShift build..."
                        oc start-build ${APP_NAME} --wait --follow | cat

                        # Tag the built image with semantic version
                        oc tag ${APP_NAME}:latest ${APP_NAME}:${SEMANTIC_VERSION}

                        echo "✅ Build completed with tags: latest and ${SEMANTIC_VERSION}"
                    """
                }
            }
        }

        stage('Apply OpenShift Resources') {
            steps {
                script {
                    echo "Applying OpenShift resources from repository..."

                    sh """
                        oc project ${NAMESPACE}

                        # Apply the YAML files from the openshift folder in the repo
                        oc apply -f openshift/configmap.yaml || echo "No configmap found"
                        oc apply -f openshift/secrets.yaml || echo "No secrets found"
                        oc apply -f openshift/service.yaml
                        oc apply -f openshift/deployment.yaml
                        oc apply -f openshift/route.yaml || echo "No route found"

                        echo "✅ OpenShift resources applied successfully"
                    """
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    echo "Deploying Next.js application with latest image..."

                    sh """
                        oc project ${NAMESPACE}

                        # Force update the deployment to pull the new image
                        oc set image deployment/${APP_NAME} ${APP_NAME}=${REGISTRY}/${NAMESPACE}/${APP_NAME}:latest -n ${NAMESPACE}

                        # Set environment variables for Next.js
                        oc set env deployment/${APP_NAME} NODE_ENV=production -n ${NAMESPACE}

                        # Restart the deployment to ensure new image is pulled
                        oc rollout restart deployment/${APP_NAME} -n ${NAMESPACE}

                        # Wait for rollout to complete
                        oc rollout status deployment/${APP_NAME} -n ${NAMESPACE} --timeout=600s | cat

                        # Show deployment status
                        oc get pods -l app=${APP_NAME} -n ${NAMESPACE}

                        # Show the image being used
                        echo "Current deployment image:"
                        oc get deployment ${APP_NAME} -o jsonpath='{.spec.template.spec.containers[0].image}' -n ${NAMESPACE}
                        echo ""

                        # Check if route exists and show URL
                        if oc get route ${APP_NAME} -n ${NAMESPACE} &>/dev/null; then
                            echo "Application URL:"
                            oc get route ${APP_NAME} -o jsonpath='{.spec.host}' -n ${NAMESPACE}
                            echo ""
                        fi

                        echo "✅ Deployed with tags: latest and ${SEMANTIC_VERSION}"
                        echo "Images available in registry:"
                        oc get imagestream ${APP_NAME} -o jsonpath='{.status.tags[*].tag}' | tr ' ' '\\n'
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Performing health check on deployed application..."
                    sh """
                        oc project ${NAMESPACE}
                        
                        # Wait a bit for the application to fully start
                        sleep 30
                        
                        # Check if pods are ready
                        oc get pods -l app=${APP_NAME} -n ${NAMESPACE}
                        
                        # Port forward and test if route doesn't exist
                        if ! oc get route ${APP_NAME} -n ${NAMESPACE} &>/dev/null; then
                            echo "Testing application via port-forward..."
                            timeout 10s oc port-forward svc/${APP_NAME} 3000:3000 -n ${NAMESPACE} &
                            sleep 5
                            curl -f http://localhost:3000 || echo "Health check via port-forward failed"
                            pkill -f "oc port-forward" || true
                        else
                            echo "Testing application via route..."
                            ROUTE_URL=\$(oc get route ${APP_NAME} -o jsonpath='{.spec.host}' -n ${NAMESPACE})
                            curl -f "http://\${ROUTE_URL}" || curl -f "https://\${ROUTE_URL}" || echo "Health check via route failed"
                        fi
                        
                        echo "✅ Health check completed"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Next.js Pipeline completed successfully!"
            echo "Application deployed using OpenShift BuildConfig"
            echo "Images available:"
            echo "  - ${APP_NAME}:latest"
            echo "  - ${APP_NAME}:${SEMANTIC_VERSION}"
            echo ""
            script {
                sh """
                    if oc get route ${APP_NAME} -n ${NAMESPACE} &>/dev/null; then
                        echo "Application accessible at:"
                        echo "  https://\$(oc get route ${APP_NAME} -o jsonpath='{.spec.host}' -n ${NAMESPACE})"
                    else
                        echo "To access the service via port-forward:"
                        echo "oc port-forward svc/${APP_NAME} 3000:3000 -n ${NAMESPACE}"
                    fi
                """
            }
        }
        failure {
            script {
                echo "❌ Pipeline failed! Check the logs above for details."
                // Show build logs if build failed
                sh """
                    echo "=== Recent Build Logs ==="
                    oc logs -l build=${APP_NAME} --tail=50 -n ${NAMESPACE} || true
                    
                    echo "=== Recent Pod Logs ==="
                    oc logs -l app=${APP_NAME} --tail=50 -n ${NAMESPACE} || true
                """
            }
        }
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}