import { DataSource } from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../role/entities/permission.entity';
import { User } from '../../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedInitialData(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const userRepository = dataSource.getRepository(User);

  // Create permissions
  const permissions = [
    // User permissions
    { name: 'user:create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'user:read', description: 'Read users', resource: 'users', action: 'read' },
    { name: 'user:update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'user:delete', description: 'Delete users', resource: 'users', action: 'delete' },
    
    // Role permissions
    { name: 'role:create', description: 'Create roles', resource: 'roles', action: 'create' },
    { name: 'role:read', description: 'Read roles', resource: 'roles', action: 'read' },
    { name: 'role:update', description: 'Update roles', resource: 'roles', action: 'update' },
    { name: 'role:delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
    
    // Permission permissions
    { name: 'permission:create', description: 'Create permissions', resource: 'permissions', action: 'create' },
    { name: 'permission:read', description: 'Read permissions', resource: 'permissions', action: 'read' },
    { name: 'permission:update', description: 'Update permissions', resource: 'permissions', action: 'update' },
    { name: 'permission:delete', description: 'Delete permissions', resource: 'permissions', action: 'delete' },
    
    // Product permissions
    { name: 'product:create', description: 'Create products', resource: 'products', action: 'create' },
    { name: 'product:read', description: 'Read products', resource: 'products', action: 'read' },
    { name: 'product:update', description: 'Update products', resource: 'products', action: 'update' },
    { name: 'product:delete', description: 'Delete products', resource: 'products', action: 'delete' },
    
    // Inventory permissions
    { name: 'inventory:read', description: 'Read inventory', resource: 'inventory', action: 'read' },
    { name: 'inventory:update', description: 'Update inventory', resource: 'inventory', action: 'update' },
    
    // Report permissions
    { name: 'report:read', description: 'Read reports', resource: 'reports', action: 'read' },
    { name: 'report:generate', description: 'Generate reports', resource: 'reports', action: 'generate' },
  ];

  const createdPermissions = [];
  for (const permissionData of permissions) {
    const existingPermission = await permissionRepository.findOne({
      where: { name: permissionData.name }
    });
    
    if (!existingPermission) {
      const permission = permissionRepository.create(permissionData);
      const savedPermission = await permissionRepository.save(permission);
      createdPermissions.push(savedPermission);
      console.log(`Created permission: ${permissionData.name}`);
    } else {
      createdPermissions.push(existingPermission);
    }
  }

  // Create roles
  const roles = [
    {
      name: 'super_admin',
      description: 'Super Administrator with full access',
      permissionNames: permissions.map(p => p.name) // All permissions
    },
    {
      name: 'admin',
      description: 'Administrator with most privileges',
      permissionNames: [
        'user:create', 'user:read', 'user:update',
        'role:read', 'permission:read',
        'product:create', 'product:read', 'product:update', 'product:delete',
        'inventory:read', 'inventory:update',
        'report:read', 'report:generate'
      ]
    },
    {
      name: 'manager',
      description: 'Manager with limited administrative access',
      permissionNames: [
        'user:read', 'user:update',
        'product:create', 'product:read', 'product:update',
        'inventory:read', 'inventory:update',
        'report:read', 'report:generate'
      ]
    },
    {
      name: 'employee',
      description: 'Regular employee with basic access',
      permissionNames: [
        'product:read', 'product:update',
        'inventory:read', 'inventory:update'
      ]
    },
    {
      name: 'viewer',
      description: 'Read-only access',
      permissionNames: [
        'user:read', 'product:read', 'inventory:read', 'report:read'
      ]
    }
  ];

  const createdRoles = [];
  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name }
    });
    
    if (!existingRole) {
      const rolePermissions = createdPermissions.filter(p => 
        roleData.permissionNames.includes(p.name)
      );
      
      const role = roleRepository.create({
        name: roleData.name,
        description: roleData.description,
        permissions: rolePermissions
      });
      
      const savedRole = await roleRepository.save(role);
      createdRoles.push(savedRole);
      console.log(`Created role: ${roleData.name} with ${rolePermissions.length} permissions`);
    } else {
      createdRoles.push(existingRole);
    }
  }

  // Create default super admin user
  const existingSuperAdmin = await userRepository.findOne({
    where: { email: 'admin@lyricsflip.com' }
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
    
    const superAdmin = userRepository.create({
      username: 'superadmin',
      email: 'admin@lyricsflip.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      isEmailVerified: true,
      roles: superAdminRole ? [superAdminRole] : []
    });

    await userRepository.save(superAdmin);
    console.log('Created super admin user: admin@lyricsflip.com / admin123');
  }

  console.log('Initial data seeding completed!');
} 