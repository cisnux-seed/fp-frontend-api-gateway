// // Jenkinsfile for Next.js Application Deployment to OpenShift

// pipeline {
//     agent any

//     environment {
//         // --- KONFIGURASI PENTING ---
//         // Ganti dengan nama proyek OpenShift Anda
//         OPENSHIFT_PROJECT = 'bni-project'
//         // Nama aplikasi yang akan dibuat di OpenShift
//         APP_NAME = 'bni-transaction-app'
//         // URL Server API OpenShift Anda (dapatkan dari 'crc console' atau 'oc whoami --show-server')
//         OPENSHIFT_API_URL = 'https://api.crc.testing:6443'
//         // Kredensial untuk login ke OpenShift (ID dari Jenkins Credentials)
//         OPENSHIFT_CREDENTIALS_ID = 'openshift-login-credentials'
//     }

//     stages {
//         stage('Cleanup Workspace') {
//             steps {
//                 // Membersihkan workspace dari build sebelumnya
//                 cleanWs()
//             }
//         }

//         stage('Checkout Code') {
//             steps {
//                 // Mengambil kode dari repository Git
//                 git branch: 'main', url: 'https://github.com/your-username/your-repo.git' // <-- GANTI DENGAN URL REPO GIT ANDA
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     // Membangun image Docker menggunakan Dockerfile di root proyek
//                     // Nama image akan sama dengan APP_NAME
//                     sh "docker build -t ${APP_NAME} ."
//                 }
//             }
//         }

//         stage('Login to OpenShift') {
//             steps {
//                 script {
//                     // Login ke registry internal OpenShift
//                     // Ini penting agar kita bisa mendorong (push) image
//                     def registryUrl = sh(script: "oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'", returnStdout: true).trim()
                    
//                     withCredentials([string(credentialsId: OPENSHIFT_CREDENTIALS_ID, variable: 'OPENSHIFT_TOKEN')]) {
//                         sh "docker login -u \$(oc whoami) -p \${OPENSHIFT_TOKEN} ${registryUrl}"
                        
//                         // Tag image yang sudah kita build agar sesuai format OpenShift
//                         sh "docker tag ${APP_NAME}:latest ${registryUrl}/${OPENSHIFT_PROJECT}/${APP_NAME}:latest"
//                     }
//                 }
//             }
//         }

//         stage('Push Image to OpenShift Registry') {
//             steps {
//                 script {
//                     // Mendorong image ke registry internal OpenShift
//                     def registryUrl = sh(script: "oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'", returnStdout: true).trim()
//                     sh "docker push ${registryUrl}/${OPENSHIFT_PROJECT}/${APP_NAME}:latest"
//                 }
//             }
//         }

//         stage('Deploy to OpenShift') {
//             steps {
//                 withCredentials([string(credentialsId: OPENSHIFT_CREDENTIALS_ID, variable: 'OPENSHIFT_TOKEN')]) {
//                     // Login ke cluster OpenShift dari dalam Jenkins
//                     sh "oc login --token=\${OPENSHIFT_TOKEN} --server=${OPENSHIFT_API_URL}"
//                     sh "oc project ${OPENSHIFT_PROJECT}"

//                     // Hapus deployment lama jika ada untuk memastikan fresh deploy
//                     sh "oc delete all --selector app=${APP_NAME} -n ${OPENSHIFT_PROJECT} || true"
//                     sh "oc delete configmap ${APP_NAME}-config -n ${OPENSHIFT_PROJECT} || true"

//                     // === Konfigurasi Database ===
//                     // Membuat ConfigMap yang akan menjadi environment variable untuk aplikasi kita.
//                     // Ini sama dengan file .env.local, tetapi untuk lingkungan OpenShift.
//                     // Gunakan nama service database (bni-db), bukan localhost.
//                     sh """
//                     oc create configmap ${APP_NAME}-config \\
//                       --from-literal=POSTGRES_URL='postgres://final_project_bni_user:mysecretpassword@bni-db:5432/final_project_bni' \\
//                       -n ${OPENSHIFT_PROJECT}
//                     """

//                     // Membuat aplikasi baru di OpenShift menggunakan image yang sudah kita push
//                     sh "oc new-app ${OPENSHIFT_PROJECT}/${APP_NAME}:latest --name=${APP_NAME} -n ${OPENSHIFT_PROJECT}"
                    
//                     // Menghubungkan ConfigMap ke deployment aplikasi
//                     sh "oc set env dc/${APP_NAME} --from=configmap/${APP_NAME}-config -n ${OPENSHIFT_PROJECT}"
                    
//                     // Mengekspos aplikasi agar bisa diakses dari luar cluster
//                     sh "oc expose service/${APP_NAME} -n ${OPENSHIFT_PROJECT}"
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             // Selalu logout dari registry Docker setelah selesai
//             script {
//                 def registryUrl = sh(script: "oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}'", returnStdout: true).trim()
//                 sh "docker logout ${registryUrl}"
//             }
//             echo 'Pipeline finished.'
//         }
//     }
// }
