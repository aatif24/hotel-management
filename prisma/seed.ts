// prisma/seed.ts
import { prisma } from "@prisma/prisma";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client for creating test users
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
"sb_secret_2J6JN9vP2YpeZ3ucG8PCpQ_Ss8bKWvi"!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();

  console.log("✅ Cleaned existing data");

  // ===========================
  // RBAC: Permissions
  // ===========================
  const permissions = await Promise.all([
    prisma.permission.create({
      data: { code: "menu.view" },
    }),
    prisma.permission.create({
      data: { code: "menu.create" },
    }),
    prisma.permission.create({
      data: { code: "menu.update" },
    }),
    prisma.permission.create({
      data: { code: "menu.delete" },
    }),
    prisma.permission.create({
      data: { code: "order.view" },
    }),
    prisma.permission.create({
      data: { code: "order.create" },
    }),
    prisma.permission.create({
      data: { code: "order.update" },
    }),
    prisma.permission.create({
      data: { code: "order.delete" },
    }),
    prisma.permission.create({
      data: { code: "table.view" },
    }),
    prisma.permission.create({
      data: { code: "table.manage" },
    }),
    prisma.permission.create({
      data: { code: "user.view" },
    }),
    prisma.permission.create({
      data: { code: "user.manage" },
    }),
    prisma.permission.create({
      data: { code: "role.view" },
    }),
    prisma.permission.create({
      data: { code: "role.manage" },
    }),
  ]);

  console.log("✅ Created permissions");

  // ===========================
  // RBAC: Roles
  // ===========================
  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        create: permissions.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: "manager",
      permissions: {
        create: permissions
          .filter(
            (p) =>
              !p.code.includes("role.manage") && !p.code.includes("user.manage")
          )
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const waiterRole = await prisma.role.create({
    data: {
      name: "waiter",
      permissions: {
        create: permissions
          .filter(
            (p) =>
              p.code.startsWith("menu.view") ||
              p.code.startsWith("order.") ||
              p.code.startsWith("table.")
          )
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const kitchenRole = await prisma.role.create({
    data: {
      name: "kitchen",
      permissions: {
        create: permissions
          .filter(
            (p) =>
              p.code === "menu.view" ||
              p.code === "order.view" ||
              p.code === "order.update"
          )
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  console.log("✅ Created roles");

  // ===========================
  // Create Supabase Users & Sync to DB
  // ===========================
  const testUsers = [
    {
      email: "admin@restaurant.com",
      password: "admin123456",
      name: "Admin User",
      roleId: adminRole.id,
    },
    {
      email: "manager@restaurant.com",
      password: "manager123456",
      name: "Restaurant Manager",
      roleId: managerRole.id,
    },
    {
      email: "waiter1@restaurant.com",
      password: "waiter123456",
      name: "John Waiter",
      roleId: waiterRole.id,
    },
    {
      email: "waiter2@restaurant.com",
      password: "waiter123456",
      name: "Sarah Server",
      roleId: waiterRole.id,
    },
    {
      email: "kitchen@restaurant.com",
      password: "kitchen123456",
      name: "Kitchen Staff",
      roleId: kitchenRole.id,
    },
  ];

  console.log("\n🔄 Creating Supabase users...");
  console.log("Note: Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env");

  for (const userData of testUsers) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
        },
      });

      if (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
        console.log(`   Trying to find existing user...`);

        // Try to get existing user by email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === userData.email);

        if (existingUser) {
          console.log(`   ✅ Found existing user, syncing to database...`);
          await prisma.user.upsert({
            where: { email: userData.email },
            update: {
              name: userData.name,
              roleId: userData.roleId,
            },
            create: {
              id: existingUser.id,
              email: userData.email,
              name: userData.name,
              roleId: userData.roleId,
            },
          });
          console.log(`   ✅ Synced: ${userData.email}`);
        }
        continue;
      }

      if (authData.user) {
        // Create user in database with Supabase user ID
        await prisma.user.create({
          data: {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            roleId: userData.roleId,
          },
        });
        console.log(`✅ Created user: ${userData.email}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`❌ Failed to create user ${userData.email}:`, error.message);
    }
  }

  console.log("✅ Created and synced users");

  // ===========================
  // Menu Items
  // ===========================
  const menuItems = await Promise.all([
    // Appetizers
    prisma.menuItem.create({
      data: {
        name: "Spring Rolls",
        description: "Crispy vegetable spring rolls with sweet chili sauce",
        price: 8.99,
        category: "Appetizers",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Garlic Bread",
        description: "Toasted bread with garlic butter and herbs",
        price: 6.99,
        category: "Appetizers",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Buffalo Wings",
        description: "Spicy chicken wings with ranch dressing",
        price: 12.99,
        category: "Appetizers",
      },
    }),
    // Main Courses
    prisma.menuItem.create({
      data: {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with lemon butter sauce",
        price: 24.99,
        category: "Main Course",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Ribeye Steak",
        description: "12oz ribeye with mashed potatoes and vegetables",
        price: 32.99,
        category: "Main Course",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Chicken Alfredo",
        description: "Fettuccine pasta with creamy alfredo sauce",
        price: 18.99,
        category: "Main Course",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Vegetable Curry",
        description: "Mixed vegetables in aromatic curry sauce with rice",
        price: 16.99,
        category: "Main Course",
      },
    }),
    // Desserts
    prisma.menuItem.create({
      data: {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with vanilla ice cream",
        price: 9.99,
        category: "Desserts",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Cheesecake",
        description: "New York style cheesecake with berry compote",
        price: 8.99,
        category: "Desserts",
      },
    }),
    // Beverages
    prisma.menuItem.create({
      data: {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: 4.99,
        category: "Beverages",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Iced Coffee",
        description: "Cold brew coffee with ice",
        price: 5.99,
        category: "Beverages",
      },
    }),
    prisma.menuItem.create({
      data: {
        name: "Craft Beer",
        description: "Selection of local craft beers",
        price: 7.99,
        category: "Beverages",
      },
    }),
  ]);

  console.log("✅ Created menu items");

  // ===========================
  // Tables
  // ===========================
  await prisma.table.createMany({
    data: [
      { number: 1, status: "available" },
      { number: 2, status: "available" },
      { number: 3, status: "occupied" },
      { number: 4, status: "occupied" },
      { number: 5, status: "available" },
      { number: 6, status: "reserved" },
      { number: 7, status: "available" },
      { number: 8, status: "available" },
      { number: 9, status: "occupied" },
      { number: 10, status: "available" },
    ],
  });

  console.log("✅ Created tables");

  // ===========================
  // Orders
  // ===========================
  const order1 = await prisma.order.create({
    data: {
      tableId: 3,
      status: "in_progress",
      total: 0,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        menuItemId: menuItems[0].id,
        quantity: 2,
        price: menuItems[0].price,
      },
      {
        orderId: order1.id,
        menuItemId: menuItems[3].id,
        quantity: 1,
        price: menuItems[3].price,
      },
      {
        orderId: order1.id,
        menuItemId: menuItems[9].id,
        quantity: 2,
        price: menuItems[9].price,
      },
    ],
  });

  const order1Total =
    menuItems[0].price * 2 + menuItems[3].price + menuItems[9].price * 2;
  await prisma.order.update({
    where: { id: order1.id },
    data: { total: order1Total },
  });

  const order2 = await prisma.order.create({
    data: {
      tableId: 4,
      status: "in_progress",
      total: 0,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        menuItemId: menuItems[2].id,
        quantity: 1,
        price: menuItems[2].price,
      },
      {
        orderId: order2.id,
        menuItemId: menuItems[4].id,
        quantity: 2,
        price: menuItems[4].price,
      },
      {
        orderId: order2.id,
        menuItemId: menuItems[11].id,
        quantity: 2,
        price: menuItems[11].price,
      },
    ],
  });

  const order2Total =
    menuItems[2].price + menuItems[4].price * 2 + menuItems[11].price * 2;
  await prisma.order.update({
    where: { id: order2.id },
    data: { total: order2Total },
  });

  console.log("✅ Created orders");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Permissions: ${permissions.length}`);
  console.log("   - Roles: 4 (admin, manager, waiter, kitchen)");
  console.log("   - Users: 5 (synced with Supabase Auth)");
  console.log(`   - Menu Items: ${menuItems.length}`);
  console.log("   - Tables: 10");
  console.log("   - Orders: 2 active orders");
  console.log("\n👤 Test Login Credentials:");
  console.log("   - admin@restaurant.com / admin123456");
  console.log("   - manager@restaurant.com / manager123456");
  console.log("   - waiter1@restaurant.com / waiter123456");
  console.log("   - waiter2@restaurant.com / waiter123456");
  console.log("   - kitchen@restaurant.com / kitchen123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
