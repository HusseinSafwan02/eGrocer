const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
  return { hash, salt };
}

async function main() {
  console.log('Seeding database...');

  // Create category hierarchy
  // Level 1: Departments
  const produce = await prisma.category.create({ data: { name: 'Produce', level: 1 } });
  const dairy = await prisma.category.create({ data: { name: 'Dairy & Eggs', level: 1 } });
  const beverages = await prisma.category.create({ data: { name: 'Beverages', level: 1 } });
  const snacks = await prisma.category.create({ data: { name: 'Snacks & Confectionery', level: 1 } });
  const frozen = await prisma.category.create({ data: { name: 'Frozen Foods', level: 1 } });
  const bakery = await prisma.category.create({ data: { name: 'Bakery', level: 1 } });

  // Level 2: Categories
  const fruits = await prisma.category.create({ data: { name: 'Fruits', level: 2, parentId: produce.id } });
  const vegetables = await prisma.category.create({ data: { name: 'Vegetables', level: 2, parentId: produce.id } });
  const milk = await prisma.category.create({ data: { name: 'Milk & Cream', level: 2, parentId: dairy.id } });
  const cheese = await prisma.category.create({ data: { name: 'Cheese', level: 2, parentId: dairy.id } });
  const softDrinks = await prisma.category.create({ data: { name: 'Soft Drinks', level: 2, parentId: beverages.id } });
  const juices = await prisma.category.create({ data: { name: 'Juices', level: 2, parentId: beverages.id } });
  const chips = await prisma.category.create({ data: { name: 'Chips & Crisps', level: 2, parentId: snacks.id } });
  const chocolate = await prisma.category.create({ data: { name: 'Chocolate', level: 2, parentId: snacks.id } });
  const frozenMeals = await prisma.category.create({ data: { name: 'Frozen Meals', level: 2, parentId: frozen.id } });
  const iceCream = await prisma.category.create({ data: { name: 'Ice Cream', level: 2, parentId: frozen.id } });
  const bread = await prisma.category.create({ data: { name: 'Bread', level: 2, parentId: bakery.id } });

  // Level 3: Sub-categories
  const tropicalFruits = await prisma.category.create({ data: { name: 'Tropical Fruits', level: 3, parentId: fruits.id } });
  const berries = await prisma.category.create({ data: { name: 'Berries', level: 3, parentId: fruits.id } });
  const leafyGreens = await prisma.category.create({ data: { name: 'Leafy Greens', level: 3, parentId: vegetables.id } });
  const rootVeg = await prisma.category.create({ data: { name: 'Root Vegetables', level: 3, parentId: vegetables.id } });

  console.log('Categories created.');

  // Create products
  const products = [
    // Tropical Fruits
    { name: 'Cavendish Banana', brand: 'Fresh Farms', description: 'Sweet and ripe Cavendish bananas, perfect for snacking or smoothies.', price: 2.50, stockQty: 150, sizeWeight: '1 bunch (~500g)', images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], categoryId: tropicalFruits.id },
    { name: 'Mango Alphonso', brand: 'Tropical Harvest', description: 'Premium Alphonso mangoes, sweet with a rich golden flesh.', price: 4.90, stockQty: 80, sizeWeight: 'Each (~350g)', images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'], categoryId: tropicalFruits.id },
    { name: 'Papaya', brand: 'Fresh Farms', description: 'Fresh ripe papaya with vibrant orange flesh, great for breakfast.', price: 3.20, stockQty: 60, sizeWeight: 'Each (~800g)', images: ['https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400'], categoryId: tropicalFruits.id },
    { name: 'Dragon Fruit', brand: 'Exotic Select', description: 'Red dragon fruit with sweet white flesh and striking appearance.', price: 5.50, stockQty: 40, sizeWeight: 'Each (~400g)', images: ['https://images.unsplash.com/photo-1527325678964-54921661f888?w=400'], categoryId: tropicalFruits.id },

    // Berries
    { name: 'Fresh Strawberries', brand: 'Berry Best', description: 'Hand-picked strawberries, sweet and juicy.', price: 4.50, stockQty: 90, sizeWeight: '250g punnet', images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'], categoryId: berries.id },
    { name: 'Blueberries', brand: 'Berry Best', description: 'Plump, antioxidant-rich blueberries from premium farms.', price: 5.90, stockQty: 70, sizeWeight: '125g punnet', images: ['https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400'], categoryId: berries.id },
    { name: 'Raspberries', brand: 'Berry Best', description: 'Fresh raspberries, delicate and full of flavour.', price: 6.50, stockQty: 0, sizeWeight: '125g punnet', images: ['https://images.unsplash.com/photo-1474906493384-89f1ed7de3ae?w=400'], categoryId: berries.id },

    // Leafy Greens
    { name: 'Baby Spinach', brand: 'Green Leaf Co.', description: 'Tender baby spinach leaves, washed and ready to eat.', price: 2.90, stockQty: 120, sizeWeight: '200g bag', images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'], categoryId: leafyGreens.id },
    { name: 'Romaine Lettuce', brand: 'Fresh Farms', description: 'Crisp romaine lettuce, great for Caesar salads.', price: 1.90, stockQty: 85, sizeWeight: 'Each (~300g)', images: ['https://images.unsplash.com/photo-1622205313162-be1d5712a43f?w=400'], categoryId: leafyGreens.id },
    { name: 'Kale', brand: 'Green Leaf Co.', description: 'Curly kale packed with nutrients, great for salads or smoothies.', price: 3.50, stockQty: 55, sizeWeight: '250g bag', images: ['https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400'], categoryId: leafyGreens.id },

    // Root Vegetables
    { name: 'Carrots', brand: 'Fresh Farms', description: 'Sweet orange carrots, washed and ready to use.', price: 1.50, stockQty: 200, sizeWeight: '500g bag', images: ['https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400'], categoryId: rootVeg.id },
    { name: 'Sweet Potato', brand: 'Harvest Gold', description: 'Naturally sweet orange-fleshed sweet potatoes.', price: 2.20, stockQty: 110, sizeWeight: 'Each (~250g)', images: ['https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400'], categoryId: rootVeg.id },

    // Milk
    { name: 'Full Cream Milk', brand: 'Meadow Fresh', description: 'Rich and creamy full cream fresh milk.', price: 3.80, stockQty: 200, sizeWeight: '2L carton', images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'], categoryId: milk.id },
    { name: 'Low Fat Milk', brand: 'Meadow Fresh', description: 'Light and fresh low-fat milk for the health-conscious.', price: 3.80, stockQty: 150, sizeWeight: '2L carton', images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'], categoryId: milk.id },
    { name: 'Oat Milk', brand: 'Oatly', description: 'Creamy oat milk, barista edition. Great for coffee.', price: 5.50, stockQty: 90, sizeWeight: '1L carton', images: ['https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400'], categoryId: milk.id },

    // Cheese
    { name: 'Cheddar Cheese Block', brand: 'Mainland', description: 'Sharp aged cheddar cheese, perfect for sandwiches and cooking.', price: 7.90, stockQty: 65, sizeWeight: '250g block', images: ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400'], categoryId: cheese.id },
    { name: 'Mozzarella', brand: 'Kraft', description: 'Creamy fresh mozzarella, ideal for pizza and Caprese salad.', price: 6.50, stockQty: 45, sizeWeight: '200g pack', images: ['https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400'], categoryId: cheese.id },

    // Soft Drinks
    { name: 'Coca-Cola Original', brand: 'Coca-Cola', description: 'The classic refreshing cola drink.', price: 1.90, stockQty: 300, sizeWeight: '1.5L bottle', images: ['https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400'], categoryId: softDrinks.id },
    { name: 'Sprite', brand: 'Coca-Cola', description: 'Crisp lemon-lime flavoured sparkling drink.', price: 1.90, stockQty: 250, sizeWeight: '1.5L bottle', images: ['https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400'], categoryId: softDrinks.id },
    { name: 'Sparkling Water', brand: 'Perrier', description: 'Natural sparkling mineral water from France.', price: 2.50, stockQty: 180, sizeWeight: '750ml bottle', images: ['https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400'], categoryId: softDrinks.id },

    // Juices
    { name: 'Orange Juice (No Pulp)', brand: 'Tropicana', description: 'Pure squeezed orange juice, smooth with no pulp.', price: 4.90, stockQty: 120, sizeWeight: '1L carton', images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'], categoryId: juices.id },
    { name: 'Apple Juice', brand: 'Marigold', description: 'Clear golden apple juice, naturally sweet.', price: 3.50, stockQty: 100, sizeWeight: '1L carton', images: ['https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=400'], categoryId: juices.id },

    // Chips
    { name: "Lay's Classic Salted", brand: "Lay's", description: 'Crispy potato chips with classic salt flavour.', price: 2.50, stockQty: 200, sizeWeight: '150g bag', images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'], categoryId: chips.id },
    { name: 'Pringles Original', brand: 'Pringles', description: 'Stackable potato crisps in an iconic can.', price: 4.90, stockQty: 160, sizeWeight: '165g can', images: ['https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400'], categoryId: chips.id },

    // Chocolate
    { name: 'KitKat 4-Finger', brand: 'Nestlé', description: 'Have a break! Classic milk chocolate wafer fingers.', price: 1.80, stockQty: 250, sizeWeight: '41.5g bar', images: ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'], categoryId: chocolate.id },
    { name: "Cadbury Dairy Milk", brand: "Cadbury", description: 'Rich and creamy milk chocolate, the nation\'s favourite.', price: 3.50, stockQty: 180, sizeWeight: '110g bar', images: ['https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400'], categoryId: chocolate.id },

    // Frozen Meals
    { name: 'Chicken Fried Rice', brand: 'Ajinomoto', description: 'Ready-to-eat Japanese-style chicken fried rice.', price: 5.50, stockQty: 80, sizeWeight: '300g pack', images: ['https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'], categoryId: frozenMeals.id },

    // Ice Cream
    { name: 'Vanilla Ice Cream', brand: 'Haagen-Dazs', description: 'Classic Madagascar vanilla bean ice cream.', price: 12.90, stockQty: 50, sizeWeight: '473ml tub', images: ['https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'], categoryId: iceCream.id },

    // Bread
    { name: 'Wholemeal Bread', brand: 'Gardenia', description: 'Wholesome wholemeal sandwich bread, soft and fluffy.', price: 2.90, stockQty: 140, sizeWeight: '400g loaf', images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'], categoryId: bread.id },
    { name: 'White Sandwich Bread', brand: 'Gardenia', description: 'Classic white bread, perfect for sandwiches and toast.', price: 2.50, stockQty: 160, sizeWeight: '400g loaf', images: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400'], categoryId: bread.id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`${products.length} products created.`);

  // Create admin user
  const adminPass = hashPassword('Admin@1234');
  await prisma.user.create({
    data: {
      email: 'admin@egrocer.com',
      name: 'Admin User',
      passwordHash: adminPass.hash,
      passwordSalt: adminPass.salt,
      role: 'ADMINISTRATOR',
      phone: '+65 9000 0000',
      address: '1 eGROCERY Way, Singapore 123456',
    },
  });

  // Create a demo customer
  const custPass = hashPassword('Customer@1234');
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Demo Customer',
      passwordHash: custPass.hash,
      passwordSalt: custPass.salt,
      role: 'CUSTOMER',
      phone: '+65 8123 4567',
      address: '10 Orchard Road, Singapore 238888',
    },
  });

  console.log('Seed users created:');
  console.log('  Admin:    admin@egrocer.com    / Admin@1234');
  console.log('  Customer: customer@example.com / Customer@1234');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
