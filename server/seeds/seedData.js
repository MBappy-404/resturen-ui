require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), Organization.deleteMany({}),
      Category.deleteMany({}), MenuItem.deleteMany({}), Table.deleteMany({})
    ]);

    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'Admin User', email: 'admin@restaurant.com',
      password: hashedPassword, phone: '01700000000', role: 'admin'
    });

    console.log('Creating organization...');
    const org = await Organization.create({
      name: 'Foodie Paradise', owner: admin._id,
      description: 'Experience the finest dining with our carefully crafted menu featuring authentic Bengali and international cuisine.',
      address: 'House 12, Road 5, Dhanmondi, Dhaka-1205',
      phone: '+880 1700-000000', email: 'info@foodieparadise.com',
      website: 'https://foodieparadise.com',
      socialMedia: { facebook: 'https://facebook.com/foodieparadise', instagram: 'https://instagram.com/foodieparadise' },
      taxRate: 5, currency: 'BDT', currencySymbol: '৳',
      settings: { serviceCharge: 10, vatRate: 5, invoicePrefix: 'INV', orderPrefix: 'ORD', deliveryCharge: 60, freeDeliveryMinOrder: 500, minOrderAmount: 150, estimatedDeliveryTime: '30-45 min', acceptOnlineOrders: true, acceptReservations: true },
      openingHours: [
        { day: 'Saturday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Sunday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Monday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Tuesday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Wednesday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Thursday', open: '10:00', close: '23:00', isClosed: false },
        { day: 'Friday', open: '12:00', close: '23:00', isClosed: false }
      ],
      features: ['WiFi', 'AC', 'Parking', 'Live Music', 'Private Dining', 'Outdoor Seating'],
      subscription: 'premium'
    });

    admin.organization = org._id;
    await admin.save();

    console.log('Creating categories...');
    const categories = await Category.insertMany([
      { name: 'Appetizers', nameBn: 'এপেটাইজার', description: 'Start your meal with our delicious appetizers', icon: 'soup', organization: org._id, sortOrder: 0 },
      { name: 'Main Course', nameBn: 'মেইন কোর্স', description: 'Our signature main dishes', icon: 'utensils', organization: org._id, sortOrder: 1 },
      { name: 'Biriyani & Rice', nameBn: 'বিরিয়ানি ও ভাত', description: 'Aromatic rice dishes', icon: 'flame', organization: org._id, sortOrder: 2 },
      { name: 'BBQ & Grill', nameBn: 'বিবিকিউ ও গ্রিল', description: 'Freshly grilled items', icon: 'beef', organization: org._id, sortOrder: 3 },
      { name: 'Desserts', nameBn: 'মিষ্টি', description: 'Sweet endings to your meal', icon: 'cake', organization: org._id, sortOrder: 4 },
      { name: 'Beverages', nameBn: 'পানীয়', description: 'Refreshing drinks', icon: 'cup-soda', organization: org._id, sortOrder: 5 },
      { name: 'Snacks', nameBn: 'স্ন্যাকস', description: 'Light bites and snacks', icon: 'cookie', organization: org._id, sortOrder: 6 }
    ]);

    console.log('Creating menu items...');
    await MenuItem.insertMany([
      // Appetizers
      { name: 'Chicken Tikka', nameBn: 'চিকেন টিক্কা', description: 'Tender chicken marinated in spices and grilled to perfection', price: 320, category: categories[0]._id, organization: org._id, tags: ['popular', 'halal'], isAvailable: true, isFeatured: true, preparationTime: 20, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', rating: 4.5, reviewCount: 28, orderCount: 156 },
      { name: 'Vegetable Spring Roll', nameBn: 'ভেজিটেবল স্প্রিং রোল', description: 'Crispy rolls filled with mixed vegetables', price: 180, category: categories[0]._id, organization: org._id, tags: ['vegetarian', 'new'], isAvailable: true, preparationTime: 15, image: 'https://images.unsplash.com/photo-1606525437679-037aca74a3e9?w=400', rating: 4.2, reviewCount: 15, orderCount: 89 },
      { name: 'Fish Pakora', nameBn: 'মাছের পাকোড়া', description: 'Deep fried fish fritters with special spices', price: 250, category: categories[0]._id, organization: org._id, tags: ['halal', 'popular'], isAvailable: true, preparationTime: 15, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', rating: 4.3, reviewCount: 20, orderCount: 112 },
      { name: 'Shrimp Tempura', nameBn: 'চিংড়ি টেম্পুরা', description: 'Lightly battered and fried prawns', price: 450, category: categories[0]._id, organization: org._id, tags: ['chef_special'], isAvailable: true, isFeatured: true, preparationTime: 20, image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400', rating: 4.7, reviewCount: 32, orderCount: 78 },

      // Main Course
      { name: 'Butter Chicken', nameBn: 'বাটার চিকেন', description: 'Creamy tomato-based chicken curry', price: 380, category: categories[1]._id, organization: org._id, tags: ['bestseller', 'halal'], isAvailable: true, isFeatured: true, preparationTime: 25, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', rating: 4.8, reviewCount: 65, orderCount: 342, variants: [{ name: 'Half', price: 220 }, { name: 'Full', price: 380 }] },
      { name: 'Mutton Curry', nameBn: 'মাটন কারি', description: 'Slow-cooked mutton in rich gravy', price: 520, category: categories[1]._id, organization: org._id, tags: ['popular', 'halal'], isAvailable: true, preparationTime: 35, image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400', rating: 4.6, reviewCount: 42, orderCount: 198, variants: [{ name: 'Half', price: 300 }, { name: 'Full', price: 520 }] },
      { name: 'Fish Curry (Ilish)', nameBn: 'ইলিশ মাছের ঝোল', description: 'Traditional Bengali Hilsa fish curry', price: 650, category: categories[1]._id, organization: org._id, tags: ['chef_special', 'halal'], isAvailable: true, isFeatured: true, preparationTime: 30, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400', rating: 4.9, reviewCount: 55, orderCount: 167 },
      { name: 'Paneer Butter Masala', nameBn: 'পনির বাটার মশলা', description: 'Cottage cheese in creamy tomato gravy', price: 320, category: categories[1]._id, organization: org._id, tags: ['vegetarian', 'popular'], isAvailable: true, preparationTime: 20, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', rating: 4.4, reviewCount: 30, orderCount: 145 },

      // Biriyani
      { name: 'Kacchi Biriyani', nameBn: 'কাচ্চি বিরিয়ানি', description: 'Authentic Dhaka-style kacchi biriyani with tender goat meat', price: 450, category: categories[2]._id, organization: org._id, tags: ['bestseller', 'halal', 'popular'], isAvailable: true, isFeatured: true, preparationTime: 40, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', rating: 4.9, reviewCount: 120, orderCount: 589, variants: [{ name: 'Half', price: 250 }, { name: 'Full', price: 450 }] },
      { name: 'Chicken Biriyani', nameBn: 'চিকেন বিরিয়ানি', description: 'Fragrant rice with spiced chicken', price: 320, category: categories[2]._id, organization: org._id, tags: ['popular', 'halal'], isAvailable: true, isFeatured: true, preparationTime: 30, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400', rating: 4.7, reviewCount: 85, orderCount: 423 },
      { name: 'Tehari', nameBn: 'তেহারি', description: 'Beef tehari with aromatic spices', price: 280, category: categories[2]._id, organization: org._id, tags: ['halal'], isAvailable: true, preparationTime: 30, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400', rating: 4.5, reviewCount: 35, orderCount: 201 },

      // BBQ
      { name: 'Mixed Grill Platter', nameBn: 'মিক্সড গ্রিল প্লাটার', description: 'Assorted grilled meats with dips', price: 890, category: categories[3]._id, organization: org._id, tags: ['chef_special', 'halal'], isAvailable: true, isFeatured: true, preparationTime: 35, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', rating: 4.8, reviewCount: 48, orderCount: 134 },
      { name: 'Seekh Kebab', nameBn: 'সিখ কাবাব', description: 'Minced meat skewers grilled over charcoal', price: 350, category: categories[3]._id, organization: org._id, tags: ['popular', 'halal'], isAvailable: true, preparationTime: 25, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400', rating: 4.5, reviewCount: 38, orderCount: 178, addons: [{ name: 'Extra Naan', price: 40 }, { name: 'Raita', price: 30 }] },

      // Desserts
      { name: 'Firni', nameBn: 'ফিরনি', description: 'Traditional rice pudding with nuts', price: 120, category: categories[4]._id, organization: org._id, tags: ['popular', 'vegetarian'], isAvailable: true, preparationTime: 10, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', rating: 4.3, reviewCount: 22, orderCount: 156 },
      { name: 'Gulab Jamun', nameBn: 'গোলাপ জামুন', description: 'Deep-fried milk dumplings in sugar syrup', price: 150, category: categories[4]._id, organization: org._id, tags: ['bestseller', 'vegetarian'], isAvailable: true, preparationTime: 5, image: 'https://images.unsplash.com/photo-1666190050946-7b8ad5e3696d?w=400', rating: 4.6, reviewCount: 40, orderCount: 267 },
      { name: 'Chocolate Lava Cake', nameBn: 'চকোলেট লাভা কেক', description: 'Warm chocolate cake with molten center', price: 250, category: categories[4]._id, organization: org._id, tags: ['new', 'chef_special'], isAvailable: true, isFeatured: true, preparationTime: 15, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', rating: 4.8, reviewCount: 35, orderCount: 123 },

      // Beverages
      { name: 'Mango Lassi', nameBn: 'আমের লাচ্ছি', description: 'Refreshing yogurt-based mango drink', price: 120, category: categories[5]._id, organization: org._id, tags: ['popular', 'vegetarian'], isAvailable: true, preparationTime: 5, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400', rating: 4.4, reviewCount: 28, orderCount: 234 },
      { name: 'Fresh Lime Soda', nameBn: 'ফ্রেশ লেমন সোডা', description: 'Refreshing lime with soda water', price: 80, category: categories[5]._id, organization: org._id, tags: ['vegetarian'], isAvailable: true, preparationTime: 5, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400', rating: 4.2, reviewCount: 18, orderCount: 312 },
      { name: 'Chai (Masala Tea)', nameBn: 'মশলা চা', description: 'Traditional spiced tea', price: 60, category: categories[5]._id, organization: org._id, tags: ['popular', 'vegetarian'], isAvailable: true, preparationTime: 5, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', rating: 4.5, reviewCount: 50, orderCount: 567 },

      // Snacks
      { name: 'Fuchka (Panipuri)', nameBn: 'ফুচকা', description: 'Crispy shells with spiced water and fillings', price: 100, category: categories[6]._id, organization: org._id, tags: ['popular', 'vegetarian', 'bestseller'], isAvailable: true, preparationTime: 10, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', rating: 4.7, reviewCount: 60, orderCount: 445 },
      { name: 'Jhalmuri', nameBn: 'ঝালমুড়ি', description: 'Spiced puffed rice mixture', price: 80, category: categories[6]._id, organization: org._id, tags: ['vegetarian'], isAvailable: true, preparationTime: 5, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400', rating: 4.3, reviewCount: 25, orderCount: 198 }
    ]);

    console.log('Creating tables...');
    const tableData = [];
    for (let i = 1; i <= 15; i++) {
      tableData.push({
        tableNo: `T-${String(i).padStart(2, '0')}`,
        organization: org._id,
        capacity: i <= 4 ? 2 : i <= 10 ? 4 : 6,
        floor: i <= 10 ? 'Ground Floor' : '1st Floor',
        section: i <= 8 ? 'Indoor' : i <= 12 ? 'Outdoor' : 'VIP',
        status: 'available',
        position: { x: ((i - 1) % 5) * 2, y: Math.floor((i - 1) / 5) * 2 }
      });
    }
    await Table.insertMany(tableData);

    console.log('\n✅ Seed data created successfully!');
    console.log('📧 Admin Login: admin@restaurant.com / admin123');
    console.log('🍽️  Restaurant: Foodie Paradise');
    console.log(`📦 Categories: ${categories.length}`);
    console.log('🍔 Menu Items: 22');
    console.log('🪑 Tables: 15\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
