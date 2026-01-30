import { getAuth } from 'better-auth';
import { getAuthOptions } from '../src/core/auth/config';
import { headers } from 'next/headers';

async function createAdminUser() {
  console.log('🔧 正在创建管理员账户...\n');
  
  const adminEmail = 'admin@airdemo.cn';
  const adminPassword = 'admin123456';
  const adminName = '超级管理员';
  
  try {
    const auth = getAuth(await getAuthOptions({}));
    
    // 检查用户是否已存在
    let user;
    try {
      const users = await auth.api.listUsers({ headers: new Headers() });
      user = users.users?.find((u: any) => u.email === adminEmail);
    } catch (e) {
      // 用户不存在
    }
    
    if (user) {
      console.log('⚠️ 用户已存在，直接登录...\n');
    } else {
      // 创建用户
      await auth.api.signUp({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
        headers: new Headers(),
      });
      console.log('✅ 管理员账户创建成功！\n');
    }
    
    console.log('═══════════════════════════════════════');
    console.log('       📝 管理员登录信息');
    console.log('═══════════════════════════════════════');
    console.log(`   邮箱: ${adminEmail}`);
    console.log(`   密码: ${adminPassword}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 失败:', error);
    console.log('\n💡 尝试使用 API 注册...\n');
    
    // 备选方案：通过 API 注册
    try {
      const response = await fetch('http://localhost:3002/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ 通过 API 创建成功！\n');
      } else {
        console.log(`⚠️ ${data.message || '创建失败'}\n`);
      }
      
      console.log('═══════════════════════════════════════');
      console.log('       📝 管理员登录信息');
      console.log('═══════════════════════════════════════');
      console.log(`   邮箱: ${adminEmail}`);
      console.log(`   密码: ${adminPassword}`);
      console.log('═══════════════════════════════════════\n');
      
    } catch (apiError) {
      console.error('❌ API 也失败了:', apiError);
    }
  }
}

createAdminUser();
