import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Firebase Admin SDK 配置
const firebaseConfig = {
    projectId: "billionare-501bf",
    databaseURL: "https://billionare-501bf.firebaseio.com"
};

// 尝试从不同位置加载服务账户密钥
let serviceAccount: any = null;

console.log('🔍 [Firebase] 搜索服务账户密钥文件...');
console.log('   当前工作目录 (cwd):', process.cwd());

// 1. 尝试从环境变量 FIREBASE_SERVICE_ACCOUNT 加载
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ [Firebase] 从环境变量加载凭证');
    } catch (error) {
        console.warn('⚠️  [Firebase] 无法解析环境变量凭证');
    }
}

// 2. 尝试从本地文件加载
if (!serviceAccount) {
    // 后端所在目录的上一级就是项目根目录
    const projectRoot = path.join(__dirname, '../../..');  // backend/src/config -> backend -> project_root
    const backendRoot = path.join(__dirname, '../..');      // backend/src/config -> backend

    const possiblePaths = [
        // 项目根目录（serviceAccountKey.json 应该在这里）
        path.join(projectRoot, 'serviceAccountKey.json'),
        path.join(projectRoot, 'firebase-service-account.json'),

        // 后端根目录
        path.join(backendRoot, 'serviceAccountKey.json'),
        path.join(backendRoot, 'firebase-service-account.json'),

        // 使用 process.cwd() 的方式（向上一级）
        path.join(process.cwd(), '..', '..', 'serviceAccountKey.json'),
        path.join(process.cwd(), '..', '..', 'firebase-service-account.json'),
        path.join(process.cwd(), '..', 'serviceAccountKey.json'),
        path.join(process.cwd(), '..', 'firebase-service-account.json'),
    ];

    console.log('   尝试的路径:');
    for (const filePath of possiblePaths) {
        const resolvedPath = path.resolve(filePath);
        console.log(`     - ${resolvedPath}`);

        if (fs.existsSync(resolvedPath)) {
            try {
                const content = fs.readFileSync(resolvedPath, 'utf-8');
                serviceAccount = JSON.parse(content);
                console.log(`✅ [Firebase] 从文件加载凭证: ${resolvedPath}`);
                break;
            } catch (error) {
                console.warn(`⚠️  [Firebase] 无法解析文件: ${resolvedPath}`);
                console.warn(`   错误: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
}

// 初始化 Firebase Admin SDK
if (serviceAccount) {
    try {
        console.log('🔐 [Firebase] 使用服务账户凭证初始化 Firebase Admin SDK');

        // 检查是否已初始化
        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: firebaseConfig.projectId,
                databaseURL: firebaseConfig.databaseURL,
            });
        }

        console.log('✅ [Firebase] Firebase Admin SDK 初始化成功');
        console.log(`   项目 ID: ${firebaseConfig.projectId}`);
    } catch (error) {
        console.error('❌ [Firebase] 初始化失败:', error);
        throw error;
    }
} else {
    console.error('❌ [Firebase] 未找到服务账户凭证 (serviceAccountKey.json)');
    console.error('   请将 serviceAccountKey.json 放到项目根目录: /Users/a0/Downloads/interactive-drama-game/');
    console.error('   或设置环境变量 FIREBASE_SERVICE_ACCOUNT');
    throw new Error('Firebase service account credentials not found');
}

// 获取 Firestore 实例
export const db = admin.firestore();

// 设置为非严格模式
db.settings({
    ignoreUndefinedProperties: true,
});

console.log('✅ [Firebase] Firestore 实例已准备好');

export default admin;
