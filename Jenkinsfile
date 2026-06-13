pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.1-noble'
            args '--ipc=host'
        }
    }

    parameters {
        choice(name: 'PROFILE', choices: ['default', 'ui', 'api', 'smoke'], description: 'Test profile')
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit'], description: 'Browser')
        choice(name: 'ENV', choices: ['dev', 'staging', 'prod'], description: 'Environment')
    }

    environment {
        HEADLESS = 'true'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh "npx playwright install ${params.BROWSER}"
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh "cp .env.example config/.env.${params.ENV}"
                sh "ENV=${params.ENV} BROWSER=${params.BROWSER} npm run test:${params.PROFILE}"
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-results/**,playwright-report/**', allowEmptyArchive: true
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
