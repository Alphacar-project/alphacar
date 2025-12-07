pipeline {
    agent any

    environment {
        SONARQUBE = 'sonarqube' // Jenkins → System Configuration의 이름과 일치해야 함
        SONAR_URL = 'http://192.168.0.160:9000'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'alphacar-project'
        BACKEND_IMAGE = 'alphacar-backend'
        FRONTEND_IMAGE = 'alphacar-frontend'
        GIT_REPO = 'https://github.com/Alphacar-project/alphacar.git'
    }

    stages {

        // 1️⃣ Git 코드 가져오기
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        // 2️⃣ 버전 읽기
        stage('Read Version') {
            steps {
                script {
                    def backendVersion = readFile('backend/version.txt').trim()
                    def frontendVersion = readFile('frontend/version.txt').trim()
                    env.BACKEND_VERSION = backendVersion
                    env.FRONTEND_VERSION = frontendVersion
                    echo "🚀 Current Backend version: ${BACKEND_VERSION}"
                    echo "🚀 Current Frontend version: ${FRONTEND_VERSION}"
                }
            }
        }

        // 3️⃣ 버전 자동 증가
        stage('Increment Version') {
            steps {
                script {
                    def backendVersion = readFile('backend/version.txt').trim()
                    def frontendVersion = readFile('frontend/version.txt').trim()

                    def (majorB, minorB, patchB) = backendVersion.tokenize('.')
                    def (majorF, minorF, patchF) = frontendVersion.tokenize('.')

                    def newBackendVersion = "${majorB}.${minorB.toInteger() + 1}.0"
                    def newFrontendVersion = "${majorF}.${minorF.toInteger() + 1}.0"

                    writeFile file: 'backend/version.txt', text: newBackendVersion
                    writeFile file: 'frontend/version.txt', text: newFrontendVersion

                    sh """
                    git config --global user.name 'jenkins-bot'
                    git config --global user.email 'jenkins@alphacar.local'
                    git add backend/version.txt frontend/version.txt
                    git commit -m 'ci: bump version to backend:${newBackendVersion}, frontend:${newFrontendVersion}' || true
                    git push origin main || true
                    """

                    env.BACKEND_VERSION = newBackendVersion
                    env.FRONTEND_VERSION = newFrontendVersion

                    echo "🔼 Backend version updated: ${newBackendVersion}"
                    echo "🔼 Frontend version updated: ${newFrontendVersion}"
                }
            }
        }

        // 4️⃣ SonarQube - Backend
        stage('SonarQube - Backend') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        dir('backend') {
                            sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=alphacar-backend \
                              -Dsonar.projectName=alphacar-backend \
                              -Dsonar.sources=src \
                              -Dsonar.language=ts \
                              -Dsonar.host.url=${SONAR_URL} \
                              -Dsonar.login=alphacar-token \
                              -Dsonar.sourceEncoding=UTF-8
                            """
                        }
                    }
                }
            }
        }

        // 5️⃣ SonarQube - Frontend
        stage('SonarQube - Frontend') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv("${SONARQUBE}") {
                        dir('frontend') {
                            sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=alphacar-frontend \
                              -Dsonar.projectName=alphacar-frontend \
                              -Dsonar.sources=src \
                              -Dsonar.language=js \
                              -Dsonar.host.url=${SONAR_URL} \
                              -Dsonar.login=alphacar-token \
                              -Dsonar.sourceEncoding=UTF-8
                            """
                        }
                    }
                }
            }
        }

        // 6️⃣ Docker Build
        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/${BACKEND_IMAGE}:${BACKEND_VERSION} ./backend
                docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} ./frontend
                '''
            }
        }

        // 7️⃣ Trivy 보안 스캔
        stage('Trivy Security Scan') {
            steps {
                sh '''
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest \
                  client --remote http://trivy:4954 image --exit-code 1 \
                  --severity HIGH,CRITICAL ${HARBOR_URL}/${HARBOR_PROJECT}/${BACKEND_IMAGE}:${BACKEND_VERSION} || true

                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest \
                  client --remote http://trivy:4954 image --exit-code 1 \
                  --severity HIGH,CRITICAL ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION} || true
                '''
            }
        }

        // 8️⃣ Harbor Push
        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                    echo $PASS | docker login ${HARBOR_URL} -u $USER --password-stdin
                    docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${BACKEND_IMAGE}:${BACKEND_VERSION}
                    docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${FRONTEND_VERSION}
                    docker logout ${HARBOR_URL}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Build & Release Completed Successfully! 🎉"
        }
        failure {
            echo "❌ Build Failed! Check SonarQube or Trivy logs for details."
        }
    }
}

