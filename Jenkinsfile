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

        // SonarQube 분석 (순차 실행 - 병렬 시 워크스페이스 경로 충돌 발생)
        stage('SonarQube Analysis - Backend') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=alphacar-backend -Dsonar.projectName=alphacar-backend -Dsonar.sources=backend -Dsonar.host.url=${SONAR_URL} -Dsonar.sourceEncoding=UTF-8"
                    }
                }
            }
        }

        stage('SonarQube Analysis - Frontend') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        // JavaScript bridge server 타임아웃 증가 및 HTML 내 JS 분석 제외
                        sh """
                            ${scannerHome}/bin/sonar-scanner \\
                                -Dsonar.projectKey=alphacar-frontend \\
                                -Dsonar.projectName=alphacar-frontend \\
                                -Dsonar.sources=frontend \\
                                -Dsonar.host.url=${SONAR_URL} \\
                                -Dsonar.sourceEncoding=UTF-8 \\
                                -Dsonar.javascript.node.maxspace=4096 \\
                                -Dsonar.exclusions=**/*.html \\
                                -Dsonar.scanner.force-deprecated-java-version=true
                        """ || echo "⚠️ SonarQube Frontend 분석 실패했지만 빌드는 계속 진행합니다."
                    }
                }
            }
        }

        // ✅ Docker 빌드 병렬화 및 캐시 활용 (최대 4개씩 실행하여 리소스 경쟁 방지)
        stage('Build Docker Images') {
            steps {
                script {
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    
                    // Backend 서비스들을 4개씩 그룹으로 나누어 병렬 빌드
                    def serviceGroups = backendServices.collate(4)  // 4개씩 그룹화
                    
                    serviceGroups.eachWithIndex { group, groupIndex ->
                        echo "🏗️ Building group ${groupIndex + 1}/${serviceGroups.size()}: ${group.join(', ')}"
                        
                        def buildSteps = [:]
                        group.each { service ->
                            buildSteps["Backend-${service}"] = {
                                sh "docker build --build-arg APP_NAME=${service} -f backend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION} backend/"
                            }
                        }
                        
                        // 마지막 그룹에 Frontend와 Nginx 추가
                        if (groupIndex == serviceGroups.size() - 1) {
                            buildSteps['Frontend'] = {
                                sh "docker build -f frontend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} frontend/"
                            }
                            buildSteps['Nginx'] = {
                                sh "docker build -f nginx.Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION} ."
                            }
                        }
                        
                        // 그룹 내에서 병렬 실행
                        parallel buildSteps
                    }
                }
            }
        }

        // ✅ Trivy 스캔 병렬화 및 최적화 (DB는 최신 유지, 캐시 lock 충돌 방지)
        stage('Trivy Security Scan') {
            steps {
                script {
                    // Trivy DB를 한 번만 업데이트 (모든 스캔 전에)
                    echo "🔄 Updating Trivy vulnerability database..."
                    sh "docker run --rm -v trivy_cache:/root/.cache aquasec/trivy:latest image --download-db-only"
                    
                    // DB 업데이트 완료 후 충분한 대기 시간 (lock 해제 보장)
                    sleep(time: 5, unit: 'SECONDS')
                    
                    def SKIP_CACHE_FILES = "--skip-files 'root/.npm/_cacache/*'"
                    // DB 업데이트는 이미 했으므로 --skip-db-update 사용 (빠른 스캔)
                    def TRIVY_OPTIONS = "--exit-code 0 --severity HIGH,CRITICAL --timeout 5m --no-progress --skip-db-update ${SKIP_CACHE_FILES}"
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    
                    // 병렬 스캔을 3개씩 그룹으로 나누어 실행 (캐시 lock 충돌 방지)
                    def serviceGroups = backendServices.collate(3)  // 3개씩 그룹화
                    
                    serviceGroups.eachWithIndex { group, groupIndex ->
                        echo "🛡️ Scanning group ${groupIndex + 1}/${serviceGroups.size()}: ${group.join(', ')}"
                        
                        def scanSteps = [:]
                        group.each { service ->
                            scanSteps["Scan-Backend-${service}"] = {
                                echo "🛡️ Scanning Backend Service: ${service}"
                                // 각 스캔마다 짧은 지연을 추가하여 lock 충돌 방지
                                sh "sleep \$((\$RANDOM % 2)) && docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy_cache:/root/.cache aquasec/trivy:latest image ${TRIVY_OPTIONS} ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                            }
                        }
                        
                        // 마지막 그룹에 Frontend 추가
                        if (groupIndex == serviceGroups.size() - 1) {
                            scanSteps['Scan-Frontend'] = {
                                echo "🛡️ Scanning Frontend Service"
                                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy_cache:/root/.cache aquasec/trivy:latest image ${TRIVY_OPTIONS} ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                            }
                        }
                        
                        // 그룹 내에서 병렬 실행
                        parallel scanSteps
                        
                        // 그룹 간 짧은 대기 시간 (lock 해제 보장)
                        if (groupIndex < serviceGroups.size() - 1) {
                            sleep(time: 2, unit: 'SECONDS')
                        }
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
