import { db } from '../src/core/db';
import { user, role, userRole, permission, rolePermission } from '../src/config/db/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  console.log('🔧 创建管理员账户...\n');
  
  const adminEmail = 'admin@airdemo.cn';
  const adminPassword = 'admin123456'; // 实际使用应该加密
  const adminName = '超级管理员';
  
  try {
    // 1. 检查用户是否已存在
    const existingUser = await db().select().from(user).where(eq(user.email, adminEmail)).then(res => res[0]);
    
    if (existingUser) {
      console.log('⚠️ 管理员用户已存在');
      console.log(`   邮箱: ${adminEmail}`);
      console.log(`   密码: ${adminPassword}`);
    } else {
      // 2. 创建管理员用户
      const userId = nanoid();
      
      await db().insert(user).values({
        id: userId,
        email: adminEmail,
        name: adminName,
        password: adminPassword, // 注意：实际项目中应该加密
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✓ 创建用户: ${adminEmail}`);
      
      // 3. 检查管理员角色是否存在
      const adminRole = await db().select().from(role).where(eq(role.name, 'admin')).then(res => res[0]);
      
      if (!adminRole) {
        // 创建管理员角色
        const roleId = nanoid();
        await db().insert(role).values({
          id: roleId,
          name: 'admin',
          description: '超级管理员',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✓ 创建角色: admin`);
      } else {
        console.log(`✓ 角色已存在: admin (${adminRole.id})`);
      }
      
      // 4. 获取角色ID
      const roleRecord = await db().select().from(role).where(eq(role.name, 'admin')).then(res => res[0]);
      
      // 5. 分配角色给用户
      await db().insert(userRole).values({
        userId: userId,
        roleId: roleRecord!.id,
        createdAt: new Date(),
      });
      
      console.log(`✓ 分配角色: admin -> ${adminEmail}`);
      
      // 6. 检查并分配 admin.access 权限
      const adminPermission = await db().select().from(permission).where(eq(permission.name, 'admin.access')).then(res => res[0]);
      
      if (!adminPermission) {
        const permId = nanoid();
        await db().insert(permission).values({
          id: permId,
          name: 'admin.access',
          description: '管理员访问权限',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✓ 创建权限: admin.access`);
      }
      
      // 获取权限ID
      const permRecord = await db().select().from(permission).where(eq(permission.name, 'admin.access')).then(res => res[0]);
      
      // 分配权限给角色
      const existingRolePerm = await db().select().from(rolePermission).where(eq(rolePermission.roleId, roleRecord!.id)).then(res => res[0]);
      
      if (!existingRolePerm) {
        await db().insert(rolePermission).values({
          roleId: roleRecord!.id,
          permissionId: permRecord!.id,
          createdAt: new Date(),
        });
        console.log(`✓ 分配权限: admin.access -> admin role`);
      }
      
      console.log('\n✅ 管理员账户创建成功！');
    }
    
    // 打印登录信息
    console.log('\n═══════════════════════════════════════');
    console.log('       📝 管理员登录信息');
    console.log('═══════════════════════════════════════');
    console.log(`   邮箱: ${adminEmail}`);
    console.log(`   密码: ${adminPassword}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ 创建失败:', error);
    console.log('\n💡 提示: 请检查数据库连接是否正常');
  }
}

createAdminUser();
