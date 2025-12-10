pipeline {
    agent any

    environment {
        SONARQUBE = 'sonarqube'
        SONAR_URL = 'http://192.168.0.160:9000'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'alphacar-project'
        FRONTEND_IMAGE = 'alphacar-frontend'
        NGINX_IMAGE = 'alphacar-nginx'
        // HAProxy 이미지 변수 제거됨
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
                    
                    // 버전에 젠킨스 빌드 번호를 붙여서 자동 증가 (예: 1.0.25)
                    env.BACKEND_VERSION = "${baseBackVer}.${currentBuild.number}"
                    env.FRONTEND_VERSION = "${baseFrontVer}.${currentBuild.number}"
                    
                    echo "🚀 New Backend Version: ${env.BACKEND_VERSION}"
                    echo "🚀 New Frontend Version: ${env.FRONTEND_VERSION}"
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        // 백엔드 분석
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=alphacar-backend -Dsonar.projectName=alphacar-backend -Dsonar.sources=backend -Dsonar.host.url=${SONAR_URL} -Dsonar.sourceEncoding=UTF-8"
                        // 프론트엔드 분석
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=alphacar-frontend -Dsonar.projectName=alphacar-frontend -Dsonar.sources=frontend -Dsonar.host.url=${SONAR_URL} -Dsonar.sourceEncoding=UTF-8"
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def qgBackend = waitForQualityGate()
                        if (qgBackend.status != 'OK') {
                            error "Backend Quality Gate failed: ${qgBackend.status}"
                        }
                        
                        def qgFrontend = waitForQualityGate()
                        if (qgFrontend.status != 'OK') {
                            error "Frontend Quality Gate failed: ${qgFrontend.status}"
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // 1. Backend MSA (7개)
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    backendServices.each { service ->
                        sh "docker build --build-arg APP_NAME=${service} -f backend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION} backend/"
                    }

                    // 2. Frontend (1개)
                    sh "docker build -f frontend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} frontend/"

                    // 3. Nginx (HAProxy 빌드 제거됨)
                    sh "docker build -f nginx.Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION} ."
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    // 1. 백엔드 스캔
                    def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                    backendServices.each { service ->
                        echo "🛡️ Scanning Backend Service: ${service}"
                        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                    }
                    // 2. 프론트엔드 스캔
                    echo "🛡️ Scanning Frontend Service"
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    script {
                        sh 'echo $PASS | docker login ${HARBOR_URL} -u $USER --password-stdin'

                        def backendServices = ['aichat', 'community', 'drive', 'mypage', 'quote', 'search', 'main']
                        backendServices.each { service ->
                             sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${service}:${BACKEND_VERSION}"
                        }
                        sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}"
                        sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${NGINX_IMAGE}:${BACKEND_VERSION}"
                        // HAProxy Push 제거됨

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
                            
                            // 1. Secret File 내용을 읽어옴
                            def envContent = readFile(ENV_FILE_PATH).trim()

                            sh """
                            ssh -o StrictHostKeyChecking=no ${remoteUser}@${remoteIP} '
                                # 2. 원격 서버에 .env 파일 생성 (Secret 내용 + 버전 정보 추가)
                                echo "${envContent}" > ~/alphacar/deploy/.env
                                echo "BACKEND_VERSION=${BACKEND_VERSION}" >> ~/alphacar/deploy/.env
                                echo "FRONTEND_VERSION=${FRONTEND_VERSION}" >> ~/alphacar/deploy/.env

                                # 3. 하버 로그인 및 배포
                                cd ~/alphacar/deploy && \\
                                echo "${HB_PASS}" | docker login ${HARBOR_URL} -u ${HB_USER} --password-stdin && \\
                                docker compose pull && \\
                                docker compose up -d --force-recreate && \\

                                # 4. 보안을 위해 .env 파일 삭제
                                rm ~/alphacar/deploy/.env
                            '
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
