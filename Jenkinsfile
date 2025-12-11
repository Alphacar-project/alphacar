pipeline {
    agent any

    environment {
        SONARQUBE = 'sonarqube'
        SONAR_URL = 'http://192.168.0.160:9000'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'alphacar-project'
        FRONTEND_IMAGE = 'alphacar-frontend'
        NGINX_IMAGE = 'alphacar-nginx'
        GIT_REPO = 'https://github.com/Alphacar-project/alphacar.git'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('Read Version') {
            steps {
                script {
                    def baseBackVer = readFile('backend/version.txt').trim()
                    def baseFrontVer = readFile('frontend/version.txt').trim()

                    env.BACKEND_VERSION = "${baseBackVer}.${currentBuild.number}"
                    env.FRONTEND_VERSION = "${baseFrontVer}.${currentBuild.number}"

                    echo "🚀 New Backend Version: ${env.BACKEND_VERSION}"
                    echo "🚀 New Frontend Version: ${env.FRONTEND_VERSION}"
                }
            }
        }

        // SonarQube 분석 (선택적 - 실패해도 빌드 계속 진행, SKIP_SONAR=true로 완전히 스킵 가능)
        stage('SonarQube Analysis') {
            when {
                expression { return env.SKIP_SONAR != 'true' }
            }
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                        def scannerHome = tool 'sonar-scanner'
                        
                        // Backend와 Frontend 병렬 분석 (빠른 실행)
                        parallel(
                            'Backend': {
                                withSonarQubeEnv("${SONARQUBE}") {
                                    sh """
                                        timeout 300 ${scannerHome}/bin/sonar-scanner \\
                                            -Dsonar.projectKey=alphacar-backend \\
                                            -Dsonar.projectName=alphacar-backend \\
                                            -Dsonar.sources=backend \\
                                            -Dsonar.host.url=${SONAR_URL} \\
                                            -Dsonar.sourceEncoding=UTF-8 \\
                                            -Dsonar.scanner.timeout=300
                                    """ || echo "⚠️ SonarQube Backend 분석 실패 - 계속 진행"
                                }
                            },
                            'Frontend': {
                                withSonarQubeEnv("${SONARQUBE}") {
                                    sh """
                                        timeout 300 ${scannerHome}/bin/sonar-scanner \\
                                            -Dsonar.projectKey=alphacar-frontend \\
                                            -Dsonar.projectName=alphacar-frontend \\
                                            -Dsonar.sources=frontend \\
                                            -Dsonar.host.url=${SONAR_URL} \\
                                            -Dsonar.sourceEncoding=UTF-8 \\
                                            -Dsonar.exclusions=**/*.html,**/node_modules/** \\
                                            -Dsonar.javascript.node.maxspace=4096 \\
                                            -Dsonar.scanner.timeout=300
                                    """ || echo "⚠️ SonarQube Frontend 분석 실패 - 계속 진행"
                                }
                            }
                        )
                        echo "✅ SonarQube 분석 완료"
                    }
                }
            }
        }

        // ✅ Docker 빌드 병렬화 및 캐시 최적화 (캐시 활용으로 빠른 빌드)
        stage('Build Docker Images') {
            steps {
                script {
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    
                    // 모든 서비스를 한 번에 병렬 빌드 (캐시 활용으로 빠름)
                    def buildSteps = [:]
                    
                    backendServices.each { service ->
                        buildSteps["Backend-${service}"] = {
                            sh """
                                docker build \\
                                    --build-arg APP_NAME=${service} \\
                                    --build-arg BUILDKIT_INLINE_CACHE=1 \\
                                    --cache-from ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:latest \\
                                    -f backend/Dockerfile \\
                                    -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION} \\
                                    -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:latest \\
                                    backend/
                            """
                        }
                    }
                    
                    buildSteps['Frontend'] = {
                        sh """
                            docker build \\
                                --build-arg BUILDKIT_INLINE_CACHE=1 \\
                                --cache-from ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:latest \\
                                -f frontend/Dockerfile \\
                                -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} \\
                                -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:latest \\
                                frontend/
                        """
                    }
                    
                    buildSteps['Nginx'] = {
                        sh """
                            docker build \\
                                --build-arg BUILDKIT_INLINE_CACHE=1 \\
                                --cache-from ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:latest \\
                                -f nginx.Dockerfile \\
                                -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION} \\
                                -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:latest \\
                                .
                        """
                    }
                    
                    // 모든 빌드를 병렬로 실행 (캐시로 인한 충돌 최소화)
                    parallel buildSteps
                }
            }
        }

        // ✅ Trivy 스캔 최적화 (선택적 - SKIP_TRIVY=true로 스킵 가능, 빠른 스캔)
        stage('Trivy Security Scan') {
            when {
                expression { return env.SKIP_TRIVY != 'true' }
            }
            steps {
                script {
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                        // Trivy DB 업데이트 (한 번만)
                        echo "🔄 Updating Trivy DB..."
                        sh "docker run --rm -v trivy_cache:/root/.cache aquasec/trivy:latest image --download-db-only"
                        
                        def TRIVY_OPTIONS = "--exit-code 0 --severity HIGH,CRITICAL --timeout 2m --no-progress --skip-db-update --skip-files 'root/.npm/_cacache/*' --cache-dir /root/.cache/trivy"
                        def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                        
                        // 스캔을 4개씩 그룹으로 나눠서 실행 (lock 충돌 방지하면서도 빠르게)
                        def serviceGroups = backendServices.collate(4)
                        
                        serviceGroups.eachWithIndex { group, groupIndex ->
                            def scanSteps = [:]
                            group.each { service ->
                                scanSteps["Scan-${service}"] = {
                                    sh """
                                        docker run --rm \\
                                            -v /var/run/docker.sock:/var/run/docker.sock \\
                                            -v trivy_cache:/root/.cache \\
                                            aquasec/trivy:latest image ${TRIVY_OPTIONS} \\
                                            ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}
                                    """
                                }
                            }
                            
                            if (groupIndex == serviceGroups.size() - 1) {
                                scanSteps['Scan-Frontend'] = {
                                    sh """
                                        docker run --rm \\
                                            -v /var/run/docker.sock:/var/run/docker.sock \\
                                            -v trivy_cache:/root/.cache \\
                                            aquasec/trivy:latest image ${TRIVY_OPTIONS} \\
                                            ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}
                                    """
                                }
                            }
                            
                            parallel scanSteps
                            
                            // 그룹 간 짧은 대기 (lock 해제)
                            if (groupIndex < serviceGroups.size() - 1) {
                                sleep(time: 1, unit: 'SECONDS')
                            }
                        }
                        echo "✅ Trivy 스캔 완료"
                    }
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    script {
                        sh """
                        echo "\$PASS" | docker login ${HARBOR_URL} -u \$USER --password-stdin
                        """
                        
                        def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                        
                        // ✅ Push도 병렬화
                        def pushSteps = [:]
                        
                        backendServices.each { service ->
                            pushSteps["Push-Backend-${service}"] = {
                                sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                            }
                        }
                        
                        pushSteps['Push-Frontend'] = {
                            sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                        }
                        
                        pushSteps['Push-Nginx'] = {
                            sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION}"
                        }
                        
                        // 모든 push를 병렬로 실행
                        parallel pushSteps
                        
                        sh "docker logout ${HARBOR_URL}"
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                sshagent(credentials: ['ssh-server']) {
                    withCredentials([file(credentialsId: 'ALPHACAR', variable: 'ENV_FILE_PATH'),
                                     usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'HB_USER', passwordVariable: 'HB_PASS')]) {
                        script {
                            def remoteIP = '192.168.0.160'
                            def remoteUser = 'kevin'

                            def envContent = readFile(ENV_FILE_PATH).trim()

                            sh """
                            ssh -o StrictHostKeyChecking=no ${remoteUser}@${remoteIP} <<ENDSSH
                            mkdir -p ~/alphacar/deploy
                            cat > ~/alphacar/deploy/.env <<EOF_ENV
${envContent}
BACKEND_VERSION=${BACKEND_VERSION}
FRONTEND_VERSION=${FRONTEND_VERSION}
EOF_ENV
                            chmod 600 ~/alphacar/deploy/.env

                            # 하버 로그인 (원격에서 token/username으로 로그인)
                            echo "${HB_PASS}" | docker login ${HARBOR_URL} -u ${HB_USER} --password-stdin

                            cd ~/alphacar/deploy
                            docker compose pull
                            docker compose up -d --force-recreate
                            ENDSSH
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ All Stages Completed Successfully! 🎉"
        }
        failure {
            echo "❌ Build Failed! Please check the logs."
        }
    }
}
