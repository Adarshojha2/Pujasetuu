const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Pandit = require('../models/Pandit');
const Product = require('../models/Product');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
  {
    name: "Premium Brass Diya",
    description: "Handcrafted traditional brass diya for pujas, festivals, and home decor. Durable and easy to clean.",
    category: "Diyas",
    price: 349,
    stock: 50,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181382/OIP_10_h3c4o3.jpg",
    reviewsCount: 15
  },
  {
    name: "Decorative Clay Diya (Set of 6)",
    description: "Beautifully painted terracotta clay diyas, perfect for Diwali and festive decorations.",
    category: "Diyas",
    price: 199,
    stock: 120,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181395/OIP_9_vxeuqi.jpg",
    rating: 4.5,
    reviewsCount: 8
  },
  {
    name: "Sandalwood Incense Dhoop",
    description: "Pure sandalwood dhoop sticks for a calming spiritual atmosphere during daily prayers.",
    category: "Dhoop & Agarbatti",
    price: 120,
    stock: 200,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181478/OIP_7_vbbp5r.jpg",
    rating: 4.6,
    reviewsCount: 22
  },
  {
    name: "Natural Agarbatti (Champa & Rose)",
    description: "Hand-rolled natural incense sticks (agarbatti) made with essential oils. Charcoal-free.",
    category: "Dhoop & Agarbatti",
    price: 99,
    stock: 150,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181408/OIP_8_zkqkqf.jpg",
    rating: 4.4,
    reviewsCount: 19
  },
  {
    name: "Refined Camphor (Kapoor) - 100g",
    description: "Pure camphor tablets for aarti. Leaves no residue, burns completely, with a strong soothing scent.",
    category: "Puja Essentials",
    price: 150,
    stock: 80,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181420/81rv9S9wMSL._SL1500__xg5pyg.jpg",
    rating: 4.7,
    reviewsCount: 14
  },
  {
    name: "Complete Brass Puja Thali Set",
    description: "Elegant brass thali containing a small diya, incense holder, kalash, bell, and kumkum container.",
    category: "Puja Essentials",
    price: 899,
    stock: 35,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181569/OIP_11_kfovci.jpg",
    rating: 4.9,
    reviewsCount: 30
  },
  {
    name: "Copper Kalash (Lota)",
    description: "High-quality copper kalash for storing holy water or placing during pujas.",
    category: "Puja Essentials",
    price: 249,
    stock: 60,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181592/OIP_5_ah3taa.jpg",
    rating: 4.5,
    reviewsCount: 10
  },
  {
    name: "Carved Puja Bell (Ghanti)",
    description: "Resonant brass bell with Garuda carving at the top. Creates a clear and pure sound.",
    category: "Puja Essentials",
    price: 299,
    stock: 45,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181620/OIP_6_vxqkqf.jpg",
    rating: 4.7,
    reviewsCount: 12
  },
  {
    name: "5 Mukhi Rudraksha Mala (108 Beads)",
    description: "Auspicious 5 Mukhi Rudraksha bead mala for chanting (Japa) and wearing. Certified origin.",
    category: "Malas & Rudraksha",
    price: 499,
    stock: 75,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181645/OIP_4_vxqkqf.jpg",
    rating: 4.8,
    reviewsCount: 25
  },
  {
    name: "Original Tulsi Mala",
    description: "Handcrafted holy basil (Tulsi) wood bead mala, ideal for devotees of Lord Vishnu or chanting.",
    category: "Malas & Rudraksha",
    price: 150,
    stock: 90,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781182220/DSCF0273_nd3rzs.jpg",
    rating: 4.6,
    reviewsCount: 11
  },
  {
    name: "Brass Ganesha Idol (Murti)",
    description: "Beautifully detailed brass Ganesha idol for placing in the home temple or gifting.",
    category: "Idols & Murtis",
    price: 1299,
    stock: 20,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781182143/OIP_2_sazine.jpg",
    rating: 4.9,
    reviewsCount: 18
  },
  {
    name: "Marble Dust Lakshmi Murti",
    description: "Elegant white marble dust idol of Goddess Lakshmi, adorned with fine gold detailing.",
    category: "Idols & Murtis",
    price: 1499,
    stock: 15,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781182257/81-NJwgQFIL._AC__unrfht.jpg",
    rating: 4.8,
    reviewsCount: 7
  },
  {
    name: "Satyanarayan Puja Samagri Kit",
    description: "Complete kit containing everything needed for Satyanarayan Puja: kumkum, haldi, janeu, supari, raw rice, ghee, cotton wicks, gangajal, honey, and hawan wood.",
    category: "Puja Kits",
    price: 799,
    stock: 40,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781182319/OIP_1_ai76ok.jpg",
    rating: 4.8,
    reviewsCount: 16
  },
  {
    name: "Bhagavad Gita As It Is",
    description: "Original Sanskrit text, English/Hindi translations, and purports for each verse. A spiritual guide.",
    category: "Holy Books",
    price: 350,
    stock: 50,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781181459/OIP_xjxj2m.jpg",
    rating: 5.0,
    reviewsCount: 45
  },
  {
    name: "Srimad Ramayana (Set of 2)",
    description: "The classic epic of Ramayana in high-quality hardcover bindings. Detailed commentary and illustrations.",
    category: "Holy Books",
    price: 999,
    stock: 25,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781182401/img-3159_mv6mmm.jpg",
    rating: 4.9,
    reviewsCount: 13
  },
  {
    name: "Premium Diwali Puja Kit",
    description: "Comprehensive kit containing Ganesh-Lakshmi idols, 10 clay diyas, cotton wicks, ghee, roli, chandan, dhoop, agarbatti, silver coin, and toran decoration.",
    category: "Decorations & Festivals",
    price: 1199,
    stock: 100,
    image: "https://res.cloudinary.com/dnc0kpx3j/image/upload/v1781180323/A-DIY-thali-plate-as-a-part-of-easy-Laxmi-Puja-decoration-at-home_1_tjv8ka.jpg",
    rating: 4.7,
    reviewsCount: 34
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany();
    await Pandit.deleteMany();
    await Product.deleteMany();
    await Booking.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();

    console.log("Cleared old collections.");

    // 1. Create Admin User
    const adminUser = new User({
      name: "System Admin",
      email: "admin@pujasetu.com",
      password: "AdminPass123!", // Will be hashed automatically by pre-save hook
      phone: "9876543210",
      role: "admin",
      referralCode: "SETUADMIN"
    });
    await adminUser.save();
    console.log("Admin seeded successfully.");

    // 2. Create Users (Customers)
    const customer1 = new User({
      name: "Sanskriti Sharma",
      email: "sanskriti@gmail.com",
      password: "UserPass123!",
      phone: "9123456789",
      role: "user",
      referralCode: "SAN123",
      savedAddresses: [
        {
          title: "Home",
          street: "123, Dev Nagar, near Ram Mandir",
          city: "Varanasi",
          state: "Uttar Pradesh",
          zipCode: "221001",
          country: "India"
        }
      ]
    });
    await customer1.save();
    console.log("Customer 1 seeded.");

    // 3. Create Pandits (and their corresponding User accounts)
    const panditUser1 = new User({
      name: "Pandit Ramesh Shastri",
      email: "ramesh@pujasetu.com",
      password: "PanditPass123!",
      phone: "9988776655",
      role: "pandit"
    });
    await panditUser1.save();

    const pandit1 = new Pandit({
      userId: panditUser1._id,
      name: "Pandit Ramesh Shastri",
      specialization: ["Satyanarayan Puja", "Griha Pravesh Puja", "Vastu Puja", "Navagraha Puja"],
      experience: 15,
      city: "Varanasi",
      image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      verificationStatus: "verified",
      kycDoc: "kyc_ramesh_doc.pdf",
      availability: [
        { date: "2026-06-12", slots: ["08:00 AM", "11:00 AM", "04:00 PM"] },
        { date: "2026-06-13", slots: ["09:00 AM", "12:00 PM"] },
        { date: "2026-06-14", slots: ["08:00 AM", "04:00 PM"] }
      ],
      rating: 4.9,
      reviewsCount: 20,
      earnings: 4500
    });
    await pandit1.save();

    const panditUser2 = new User({
      name: "Pandit Vijay Dwivedi",
      email: "vijay@pujasetu.com",
      password: "PanditPass123!",
      phone: "9988776644",
      role: "pandit"
    });
    await panditUser2.save();

    const pandit2 = new Pandit({
      userId: panditUser2._id,
      name: "Pandit Vijay Dwivedi",
      specialization: ["Rudrabhishek", "Marriage Puja", "Naming Ceremony", "Shradh Puja"],
      experience: 12,
      city: "Haridwar",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      verificationStatus: "verified",
      kycDoc: "kyc_vijay_doc.pdf",
      availability: [
        { date: "2026-06-12", slots: ["07:00 AM", "10:00 AM", "05:00 PM"] },
        { date: "2026-06-13", slots: ["08:00 AM", "11:00 AM"] }
      ],
      rating: 4.8,
      reviewsCount: 15,
      earnings: 3200
    });
    await pandit2.save();

    const panditUser3 = new User({
      name: "Pandit Anand Tripathi",
      email: "anand@pujasetu.com",
      password: "PanditPass123!",
      phone: "9988776633",
      role: "pandit"
    });
    await panditUser3.save();

    const pandit3 = new Pandit({
      userId: panditUser3._id,
      name: "Pandit Anand Tripathi",
      specialization: ["Griha Pravesh Puja", "Satyanarayan Puja", "Festival Special Pujas", "Vastu Puja"],
      experience: 8,
      city: "Ayodhya",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      verificationStatus: "pending",
      kycDoc: "kyc_anand_doc.pdf",
      availability: [
        { date: "2026-06-12", slots: ["09:00 AM", "03:00 PM"] }
      ],
      rating: 4.5,
      reviewsCount: 4,
      earnings: 0
    });
    await pandit3.save();

    console.log("Pandits seeded.");

    // 4. Seed Products
    await Product.insertMany(products);
    console.log("Products seeded successfully.");

    // 5. Create a Mock Booking
    const mockBooking = new Booking({
      userId: customer1._id,
      panditId: pandit1._id,
      pujaType: "Satyanarayan Puja",
      date: "2026-06-13",
      time: "09:00 AM",
      address: {
        street: "123, Dev Nagar, near Ram Mandir",
        city: "Varanasi",
        state: "Uttar Pradesh",
        zipCode: "221001"
      },
      totalAmount: 2500,
      status: "confirmed",
      paymentStatus: "paid",
      razorpayOrderId: "order_mock12345",
      razorpayPaymentId: "pay_mock12345"
    });
    await mockBooking.save();
    console.log("Mock booking seeded.");

    // 6. Create a Mock Order
    const dbProducts = await Product.find({});
    const mockOrder = new Order({
      userId: customer1._id,
      products: [
        {
          productId: dbProducts[0]._id,
          name: dbProducts[0].name,
          quantity: 2,
          price: dbProducts[0].price
        },
        {
          productId: dbProducts[2]._id,
          name: dbProducts[2].name,
          quantity: 1,
          price: dbProducts[2].price
        }
      ],
      totalAmount: (dbProducts[0].price * 2) + dbProducts[2].price,
      shippingAddress: {
        street: "123, Dev Nagar, near Ram Mandir",
        city: "Varanasi",
        state: "Uttar Pradesh",
        zipCode: "221001",
        country: "India"
      },
      paymentStatus: "paid",
      orderStatus: "processing",
      razorpayOrderId: "order_mock98765",
      razorpayPaymentId: "pay_mock98765"
    });
    await mockOrder.save();
    console.log("Mock order seeded.");

    console.log("Seeding completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Seeding Error: ", error);
    process.exit(1);
  }
};

seedDB();
